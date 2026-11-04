import SidebarCardWrapper from './SidebarCardWrapper';

export default function OurOffice() {
  return (
    <SidebarCardWrapper title='Our Office'>
      <div className='flex flex-col gap-2 p-4'>
        <p className='flex items-center text-sm leading-4.5 font-semibold'>
          K Globes Digital Media Pvt. Ltd.
        </p>
        <address className='text-text-disclaimer flex items-center text-sm leading-4.5 not-italic'>
          <div>
            3<sup>rd</sup> Floor, World Centre, Beside Dinesh Hall, Nr. Torrent
            Power, Ashram Road, Navrangpura, Ahmedabad, Gujarat – 380009
          </div>
        </address>
      </div>
    </SidebarCardWrapper>
  );
}
