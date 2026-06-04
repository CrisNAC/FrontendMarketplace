export const EmptyState = ({ message, subtitle }) => (
  <div className="bg-[#F3F5F4] border border-[#C7D6CF] rounded-xl p-10 text-center">
    <p className="text-[18px] text-[#4f615b] font-medium">{message}</p>
    {subtitle && <p className="text-[14px] text-gray-500 mt-2">{subtitle}</p>}
  </div>
);
