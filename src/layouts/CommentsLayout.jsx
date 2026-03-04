import Navbar from '../components/navbar/Navbar';

export const CommentsLayout = ({ children }) => {
  return (
    <div className="flex flex-col min-h-screen bg-gray-100">
      <Navbar />
      <main className="flex-1">
        {children}
      </main>
    </div>
  );
};