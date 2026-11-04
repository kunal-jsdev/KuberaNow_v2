import ejs from 'ejs';
import { NextResponse } from 'next/server';
import nodemailer from 'nodemailer';
import path from 'path';

import {
  getFormSecret,
  validateSMTPVariables,
} from '../../../../lib/env/validateEnv';
import { checkRateLimit } from '../../../../lib/rate-limit/rateLimit';
import { generateAppId } from '../../../../lib/utils/generateAppId';
import { getString } from '../../../../lib/utils/getString';
import { sanitize } from '../../../../lib/utils/sanitize';
import { serverSideSchema } from '../../../../lib/validators/application';

export async function POST(request: Request) {
  try {
    const forwarded = request.headers.get('x-forwarded-for');
    const realIp = request.headers.get('x-real-ip');
    const ip = forwarded?.split(',')[0]?.trim() || realIp || 'unknown';

    if (!checkRateLimit(ip)) {
      return NextResponse.json(
        { error: 'Too many requests. Please try again later.' },
        { status: 429 }
      );
    }

    const formData = await request.formData();

    const website = (formData.get('website') as string) || '';
    if (website) {
      return NextResponse.json({ error: 'Spam detected' }, { status: 400 });
    }

    const position = sanitize(getString(formData, 'position'));
    const name = sanitize(getString(formData, 'name'));
    const email = sanitize(getString(formData, 'email'));
    const phoneRaw = sanitize(getString(formData, 'phone')).replace(/\D/g, '');
    const phone = phoneRaw ? Number(phoneRaw) : NaN;
    const currentCity = sanitize(getString(formData, 'currentCity'));
    const totalExperienceRaw = getString(formData, 'totalExperience');
    const linkedinUrl = sanitize(getString(formData, 'linkedinUrl'));
    const portfolioUrl = sanitize(getString(formData, 'portfolioUrl'));
    const notes = sanitize(getString(formData, 'notes'));

    const resumeFile = formData.get('resume') as File | null;
    if (!resumeFile) {
      return NextResponse.json(
        { error: 'Resume file is required' },
        { status: 400 }
      );
    }

    const allowedMimeTypes = new Set([
      'application/pdf',
      'application/msword',
      'application/vnd.openxmlformats-officedocument.wordprocessingml.document',
    ]);

    if (!allowedMimeTypes.has(resumeFile.type)) {
      return NextResponse.json(
        { error: 'Invalid resume file type' },
        { status: 400 }
      );
    }

    if (resumeFile.size > 10 * 1024 * 1024) {
      return NextResponse.json(
        { error: 'Resume file must be less than 10MB' },
        { status: 400 }
      );
    }

    const applicationId = generateAppId();

    const arrayBuffer = await resumeFile.arrayBuffer();
    const resumeBase64 = Buffer.from(arrayBuffer).toString('base64');

    const totalExperience = totalExperienceRaw ?? '';

    const payload = {
      applicationId,
      position,
      name,
      email,
      phone,
      currentCity: currentCity || undefined,
      totalExperience,
      linkedinUrl: linkedinUrl || undefined,
      portfolioUrl: portfolioUrl || undefined,
      notes: notes || undefined,
      resumeFileName: resumeFile.name,
      resumeMimeType: resumeFile.type,
      resumeBase64,
      secret: getFormSecret(),
    };

    const parsed = serverSideSchema.safeParse(payload);
    if (!parsed.success) {
      const message = parsed.error.issues
        .map((issue) => issue.message)
        .join('. ');
      return NextResponse.json({ error: message }, { status: 400 });
    }

    try {
      // --- Send Email to Admin ---
      const smtp = validateSMTPVariables();
      try {
        const transporter = nodemailer.createTransport({
          host: smtp.SMTP_HOST,
          port: smtp.SMTP_PORT,
          secure: smtp.SMTP_SECURE,
          auth: {
            user: smtp.SMTP_USER,
            pass: smtp.SMTP_PASSWORD,
          },
        });

        const templatePath = path.join(
          process.cwd(),
          'app',
          '(frontend)',
          'api',
          'job-application',
          'template.ejs'
        );

        const htmlContent = await ejs.renderFile(templatePath, {
          applicationId,
          position,
          name,
          email,
          phone,
          currentCity: currentCity || '',
          totalExperience: totalExperience || '',
          linkedinUrl: linkedinUrl || '',
          portfolioUrl: portfolioUrl || '',
          notes: notes || '',
        });

        await transporter.sendMail({
          from: `"${process.env.SMTP_FROM_NAME}" <${process.env.SMTP_FROM_EMAIL}>`,
          to: process.env.SMTP_TO_EMAIL,
          subject: `New Job Application: ${position} - ${name}`,
          html: htmlContent,
          attachments: [
            {
              filename: resumeFile.name,
              content: Buffer.from(arrayBuffer),
              contentType: resumeFile.type,
            },
          ],
        });
      } catch (emailError) {
        return NextResponse.json(
          { error: `Error sending email error: ${emailError}` },
          { status: 500 }
        );
      }
      // -----------------------------

      return NextResponse.json(
        { success: true, message: 'Application submitted successfully' },
        { status: 200 }
      );
    } catch {
      return NextResponse.json(
        { error: 'Failed to submit application' },
        { status: 502 }
      );
    }
  } catch (outerError) {
    return NextResponse.json(
      { error: `Internal server error: ${outerError}` },
      { status: 500 }
    );
  }
}
