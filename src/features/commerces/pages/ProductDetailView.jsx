import { useState, useEffect } from "react";
import { useNavigate } from "react-router-dom";
import { getProductById } from "../../commerces/services/productDetailApi";
import { getProductReviews } from "../../commerces/services/productReviewApi";

const STATIC_PRODUCT_ID = 1;

const TITLE="text-[#6B9080]";
const BODY="text-slate-900";
const SUBTLE="text-slate-600";

function Pill({children}){
return(
<span className="bg-indigo-50 text-indigo-700 px-2 rounded-full text-[10px]">
{children}
</span>
);
}

function SideCard({title,children}){
return(
<div className="rounded-2xl bg-white shadow-sm p-3">
<h3 className={`text-[12px] font-semibold ${TITLE}`}>
{title}
</h3>
<div className="mt-2">
{children}
</div>
</div>
);
}

function Row({left,right}){
return(
<div className="flex justify-between text-[11px]">
<span className={SUBTLE}>
{left}
</span>
<span className={BODY}>
{right}
</span>
</div>
);
}

export default function ProductDetailView(){

const navigate=useNavigate();

const id=STATIC_PRODUCT_ID;

const [product,setProduct]=useState(null);
const [reviews,setReviews]=useState([]);
const [stats,setStats]=useState(null);

const [loading,setLoading]=useState(true);
const [reviewLoading,setReviewLoading]=useState(true);

const [error,setError]=useState("");


/* PRODUCT */

useEffect(()=>{

const load=async()=>{

try{

const data = await getProductById(id);

setProduct(data);

}
catch(e){

setError("Error cargando producto");

}
finally{

setLoading(false);

}

};

load();

},[]);


/* REVIEWS */

useEffect(()=>{

const loadReviews=async()=>{

try{

const data = await getProductReviews(id);

setReviews(data.reviews || []);

setStats(data.stats || {});

}
catch(e){

console.error(e);

}
finally{

setReviewLoading(false);

}

};

loadReviews();

},[]);



if(loading){

return(
<div className="p-10">
Cargando producto...
</div>
);

}

if(error){

return(
<div>
{error}
</div>
);

}


return(

<div className="min-h-screen bg-[#ECF7F0] p-4">

<div className="grid grid-cols-12 gap-4">

<div className="col-span-8 space-y-4">

<div className="bg-white rounded-xl p-4">

<h1 className={`text-lg ${TITLE}`}>
{product.name}
</h1>

<p className="mt-2">
{product.description}
</p>

<div className="mt-3">
Precio:
<b>
Gs {product.price}
</b>
</div>

<div className="mt-2">
Categoria:
<Pill>
{product.category?.name}
</Pill>
</div>

<div className="mt-2">
Rating:
<b>
{product.averageRating ?? "Sin reviews"}
</b>
</div>

</div>


<div className="bg-white rounded-xl p-4">

<h3 className={TITLE}>
Reviews
</h3>

{reviewLoading &&(
<p>
Cargando reviews...
</p>
)}

{reviews.length===0 && !reviewLoading &&(
<p>
No hay reviews
</p>
)}

<div className="space-y-3">
	{reviews.map((r) => (
		<div
			key={r.id}
			className="border rounded p-3"
		>
			<div className="flex justify-between">
				<b>{r.customerName}</b>

				<span>⭐ {r.rating}</span>
			</div>

			<p className="mt-2 text-sm">
				{r.comment}
			</p>

			<div className="text-xs text-gray-400 mt-1">
				{new Date(r.date).toLocaleDateString()}
			</div>
		</div>
	))}
</div>

</div>

</div>



<div className="col-span-4 space-y-4">

<SideCard title="Stats">

<Row
left="Promedio"
right={stats?.averageRating ?? "-"}
/>

<Row
left="Total reviews"
right={stats?.totalReviews ?? 0}
/>

<Row
left="Verificadas"
right={stats?.verifiedReviews ?? 0}
/>

</SideCard>

</div>

</div>

</div>

);
}