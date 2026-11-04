import { CgCode } from 'react-icons/cg';
import { HiOutlineOfficeBuilding } from 'react-icons/hi';
import { HiOutlinePencilSquare } from 'react-icons/hi2';

import { CONTACT_DEPARTMENTS } from '../../constants/contact';

import ContactDepartmentCard from './ContactDepartmentCard';
import ContactGetInTouch from './ContactGetInTouch';
import ContactGrievanceSection from './ContactGrievanceSection';
export default function ContactUsSection() {
  const { news, press, technical } = CONTACT_DEPARTMENTS;

  return (
    <>
      <section className='flex w-full max-w-237.5 flex-col gap-4 lg:gap-5'>
        <ContactGetInTouch />

        <ContactDepartmentCard
          icon={<HiOutlinePencilSquare className='size-3.5 lg:size-4.5' />}
          {...news}
          layout='split'
        />

        <div className='grid grid-cols-1 gap-4 lg:grid-cols-2 lg:gap-4'>
          <ContactDepartmentCard
            icon={<HiOutlineOfficeBuilding className='size-3.5 lg:size-4.5' />}
            {...press}
          />
          <ContactDepartmentCard
            icon={<CgCode className='size-3.5 lg:size-4.5' />}
            {...technical}
          />
        </div>

        <ContactGrievanceSection />
      </section>
    </>
  );
}
