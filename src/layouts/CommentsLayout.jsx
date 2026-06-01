import Navbar from '../components/navbar/Navbar';

export const CommentsLayout = ({ children }) => {
  return (
    <div className="flex flex-col h-screen overflow-hidden bg-gray-100">
      <div className="shrink-0 sticky top-0 z-50">
        <Navbar />
      </div>
      <main className="flex-1 min-h-0 flex flex-col overflow-hidden">
        {children}
      </main>
    </div>
  );
};