export default function SidebarCardWrapper({
  children,
  title,
}: {
  children: React.ReactNode;
  title: string;
}) {
  return (
    <div className='border-divider flex min-w-full flex-col rounded-[5px] border bg-white md:w-76'>
      <div className='bg-dark-blue h-10.5 rounded-t-[5px] px-4 py-3'>
        <h3 className='text-surface text-sm leading-4.5 font-semibold'>
          {title}
        </h3>
      </div>
      {children}
    </div>
  );
}
