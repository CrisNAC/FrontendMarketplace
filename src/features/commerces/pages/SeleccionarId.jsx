import { useState } from "react";
import { useNavigate } from "react-router-dom";

export default function SeleccionarId(){

const [id,setId] = useState("");

const navigate = useNavigate();

const handleSubmit = ()=>{

if(!id) return;

navigate(`/comercio-producto/${id}`);

};

return(

<div className="p-10">

<h1 className="text-xl font-bold mb-5">
Probar producto por ID
</h1>

<input
type="number"
placeholder="Ej: 1"
value={id}
onChange={(e)=>setId(e.target.value)}
className="border p-2 rounded"
/>

<button
onClick={handleSubmit}
className="ml-3 bg-green-400 px-4 py-2 rounded"
>

Ver producto

</button>

</div>

);

}