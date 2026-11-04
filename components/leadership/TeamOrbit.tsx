import type { CSSProperties } from 'react';

import Image from 'next/image';

import {
  TEAM_LOGO,
  TEAM_ORBIT_LAYOUTS,
  type TeamMember,
} from '@/constants/leadership';

type OrbitLayout = (typeof TEAM_ORBIT_LAYOUTS)[keyof typeof TEAM_ORBIT_LAYOUTS];

function TeamOrbitStage({
  layout,
  members,
  className,
}: {
  layout: OrbitLayout;
  members: TeamMember[];
  className: string;
}) {
  const cq = (px: number) => `${(px / layout.width) * 100}cqw`;
  const perRing = Math.ceil(members.length / layout.rings.length);

  return (
    <div
      className={`@container relative w-full overflow-hidden ${className}`}
      style={{ aspectRatio: `${layout.width} / ${layout.height}` }}
    >
      {layout.rings.map((ring, ringIndex) => {
        const ringMembers = members.slice(
          ringIndex * perRing,
          (ringIndex + 1) * perRing
        );

        const sweep = ringMembers.length * ring.spacing;
        const duration = (ring.duration * sweep) / 210;

        return (
          <div
            key={ring.diameter}
            className='absolute -translate-1/2'
            style={{
              left: cq(ring.centerX),
              top: cq(ring.centerY),
              width: cq(ring.diameter),
              height: cq(ring.diameter),
            }}
          >
            <Image
              src={ring.arc}
              alt=''
              fill
              sizes={`${ring.diameter}px`}
              className='pointer-events-none select-none'
            />
            {ringMembers.map((member, memberIndex) => (
              <div
                key={member.id}
                className='team-orbit-item'
                style={
                  {
                    '--orbit-radius': cq(ring.diameter / 2),
                    '--orbit-avatar': layout.fixedAvatar
                      ? `${layout.avatar}px`
                      : cq(layout.avatar),
                    '--orbit-from': `${sweep / 2}deg`,
                    '--orbit-to': `${-sweep / 2}deg`,
                    '--orbit-duration': `${duration}s`,
                    '--orbit-delay': `${-((ringMembers.length - 1 - memberIndex) / ringMembers.length) * duration}s`,
                    '--orbit-direction':
                      ringIndex % 2 === 0 ? 'reverse' : 'normal',
                  } as CSSProperties
                }
              >
                <div
                  className='relative size-full overflow-hidden rounded-full border-white bg-white'
                  style={{
                    borderWidth: layout.avatar >= 80 ? 2 : 1,
                    boxShadow: '0 0 0 1px #000c9a',
                  }}
                >
                  <Image
                    src={member.image}
                    alt={member.name}
                    title={member.name}
                    fill
                    sizes={`${layout.avatar}px`}
                    className='object-cover'
                  />
                </div>
              </div>
            ))}
          </div>
        );
      })}
      <Image
        src={TEAM_LOGO}
        alt='Team KuberaNow'
        width={148}
        height={50}
        className='absolute left-1/2 -translate-x-1/2'
        style={{
          width: cq(layout.logo.width),
          height: cq(layout.logo.height),
          bottom: cq(layout.logo.bottom),
        }}
      />
    </div>
  );
}

export default function TeamOrbit({ members }: { members: TeamMember[] }) {
  return (
    <div className='@container w-full'>
      <TeamOrbitStage
        layout={TEAM_ORBIT_LAYOUTS.mobile}
        members={members}
        className='@min-[600px]:hidden'
      />
      <TeamOrbitStage
        layout={TEAM_ORBIT_LAYOUTS.desktop}
        members={members}
        className='hidden @min-[600px]:block'
      />
    </div>
  );
}
