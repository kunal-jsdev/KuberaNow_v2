import { ABOUT_VALUES } from '../../constants/about';
import PageSectionHeader from '../common/PageSectionHeader';
import ContactCardShell from '../contact-us/ContactCardShell';

export default function AboutValuesSection() {
  const gridItems = ABOUT_VALUES.items.filter((item) => !('fullWidth' in item));
  const fullWidthItem = ABOUT_VALUES.items.find(
    (item): item is (typeof ABOUT_VALUES.items)[number] & { fullWidth: true } =>
      'fullWidth' in item
  );

  return (
    <ContactCardShell
      padding='mobile'
      className='lg:rounded-lg lg:p-5'
    >
      <div className='flex w-full flex-col gap-4 lg:gap-6'>
        <PageSectionHeader
          title={ABOUT_VALUES.title}
          titleClassName='text-lg leading-[22px] text-career-heading lg:text-2xl lg:leading-7'
        />

        <div className='flex flex-col gap-3 lg:gap-5'>
          <div className='grid grid-cols-1 gap-3 lg:grid-cols-2 lg:gap-5'>
            {gridItems.map((value) => (
              <article
                key={value.title}
                className='border-career-stroke bg-career-tint rounded-md border p-3 shadow-[1px_1px_4px_0px_#0000001A] lg:p-4'
              >
                <h3 className='text-career-dark lg:text-subheading-big mb-3 text-base leading-5 font-bold lg:mb-4 lg:leading-6.5'>
                  {value.title}
                </h3>
                <p className='text-career-dark text-xs leading-4.5 lg:text-base lg:leading-5'>
                  {value.description}
                </p>
              </article>
            ))}
          </div>

          {fullWidthItem ? (
            <article className='border-career-stroke bg-career-tint rounded-md border p-3 shadow-[1px_1px_4px_0px_#0000001A] lg:p-4'>
              <h3 className='text-career-dark lg:text-subheading-big mb-3 text-base leading-5 font-bold lg:mb-4 lg:leading-6.5'>
                {fullWidthItem.title}
              </h3>
              <p className='text-career-dark text-xs leading-4.5 lg:text-base lg:leading-5'>
                {fullWidthItem.description}
              </p>
            </article>
          ) : null}
        </div>
      </div>
    </ContactCardShell>
  );
}
