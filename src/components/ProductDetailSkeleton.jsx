export const ProductDetailSkeleton = () => (
  <div className="grid grid-cols-1 md:grid-cols-2 gap-8 md:gap-16 items-start animate-pulse">
    <div className="w-full max-w-[400px] mx-auto aspect-square rounded-2xl bg-gray-200" />
    <div className="flex flex-col gap-4 pt-2">
      <div className="h-6 w-3/4 rounded bg-gray-200" />
      <div className="h-4 w-1/3 rounded bg-gray-200" />
      <div className="h-8 w-1/4 rounded bg-gray-200" />
      <div className="h-3 w-full rounded bg-gray-200" />
      <div className="h-3 w-5/6 rounded bg-gray-200" />
      <div className="h-3 w-2/3 rounded bg-gray-200" />
      <div className="mt-2 h-10 w-1/3 rounded-md bg-gray-200" />
      <div className="h-11 w-full rounded-xl bg-gray-200" />
    </div>
  </div>
);
