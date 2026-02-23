import "../styles/commerces.css";

type Props = {
    name: string;
    detail: string;
};

export const ProductItem = ({ name, detail }: Props) => {
    return (
        <div className="product-item p-2 rounded mb-2">
            <div>
                <strong>{name}</strong>
                <div className="small text-muted">{detail}</div>
            </div>
        </div>
    );
};