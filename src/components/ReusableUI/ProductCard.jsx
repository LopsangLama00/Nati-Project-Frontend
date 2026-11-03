import React from 'react';
import { Link } from 'react-router-dom';
// @react-compiler-disable

export default function ProductCard({ p }) {
  return (
    <article className="card">
      <Link to={`/product/${p.slug}`}>
        <img src={p.img} alt={p.title} />
        <h3>{p.title}</h3>
      </Link>
      <p>{p.short}</p>
      <div style={{display:'flex', justifyContent:'space-between', alignItems:'center', marginTop:10}}>
        <div className="price">${p.price}</div>
        <Link to={`/product/${p.slug}`} className="btn">View</Link>
      </div>
    </article>
  );
}
