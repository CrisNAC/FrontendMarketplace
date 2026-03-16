import { MapPin, Pencil, Trash2 } from "lucide-react";

const AddressCard = ({ address, onEdit, onDelete }) => {
    const { id_address, address: street, city, region, postal_code } = address;

    return (
        <div className="border border-gray-200 rounded-sm bg-white shadow-sm flex flex-col h-full">
            <div className="p-5 flex-1">
                <div className="flex items-start gap-3 mb-3">
                    <MapPin size={16} className="text-[#1b7bd5] mt-0.5 shrink-0" />
                    <div className="text-[14px] text-gray-800 space-y-0.5">
                        <p className="font-medium text-black text-[15px]">{street}</p>
                        <p>{city}{region ? `, ${region}` : ""}</p>
                        {postal_code && <p className="text-gray-500">CP: {postal_code}</p>}
                    </div>
                </div>
            </div>
            <div className="border-t border-gray-100 px-5 py-3 flex gap-4">
                <button
                    onClick={() => onEdit(address)}
                    className="flex items-center gap-1.5 text-[13px] text-[#1b7bd5] hover:underline"
                >
                    <Pencil size={13} />
                    Editar
                </button>
                <button
                    onClick={() => onDelete(id_address)}
                    className="flex items-center gap-1.5 text-[13px] text-red-500 hover:underline"
                >
                    <Trash2 size={13} />
                    Eliminar
                </button>
            </div>
        </div>
    );
};

export default AddressCard;