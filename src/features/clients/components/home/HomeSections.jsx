const categories = [
  {
    name: "Celulares",
    image:
      "https://images.unsplash.com/photo-1511707171634-5f897ff02aa9",
  },
  {
    name: "Moda",
    image:
      "https://images.unsplash.com/photo-1525507119028-ed4c629a60a3",
  },
  {
    name: "Salud y Belleza",
    image:
      "https://images.unsplash.com/photo-1631730486784-5456119f69ae",
  },
  {
    name: "Hogar",
    image:
      "https://images.unsplash.com/photo-1583847268964-b28dc8f51f92",
  },
  {
    name: "Deportes",
    image:
      "https://plus.unsplash.com/premium_photo-1685303469251-4ee0ea014bb3",
  },
];

const commerces = [
  { name: "Marca 1", color: "bg-[#6A907F] text-black" },
  { name: "Marca 2", color: "bg-[#6A907F] text-black" },
  { name: "Marca 3", color: "bg-[#8FAE9F] text-white" },
  { name: "Marca 4", color: "bg-[#8FAE9F] text-white" },
  { name: "Marca 5", color: "bg-[#D9D9D9] text-black" },
];

export const HomeSections = () => {
  return (
    <div className="w-[1254px] mx-auto mt-[50px]">

      {/* ================= CATEGORÍAS ================= */}
      <section className="mb-[60px]">
        <h3 className="font-semibold text-[20px] mb-[25px] text-[#333]"
        style={{fontSize: "20px", fontWeight: "bold" }}>
          Compra por categorías
        </h3>

        <div className="flex justify-between">
          {categories.map((cat, index) => (
            <div
              key={index}
              className="flex flex-col items-center gap-[10px]"
            >
              <div
                className="w-[150px] h-[150px] rounded-full bg-cover bg-center cursor-pointer transition duration-300 hover:scale-105"
                style={{ backgroundImage: `url(${cat.image})` }}
              />
              <span>{cat.name}</span>
            </div>
          ))}
        </div>
      </section>

      {/* ================= COMERCIOS ================= */}
      <section>
        <h3 className="font-semibold text-[20px] mb-[25px] text-[#333]"
                style={{fontSize: "20px", fontWeight: "bold" }}>
          Comercios
        </h3>

        <div className="flex justify-between">
          {commerces.map((commerce, index) => (
            <div
              key={index}
              className="flex flex-col items-center gap-[10px]"
            >
              <div
                className={`w-[150px] h-[150px] rounded-full flex items-center justify-center font-semibold text-[18px] cursor-pointer transition duration-300 hover:scale-105 ${commerce.color}`}
              >
                {commerce.name}
              </div>
              <span>Text</span>
            </div>
          ))}
        </div>
      </section>

    </div>
  );
};