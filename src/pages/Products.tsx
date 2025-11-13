import { useEffect, useState } from "react";
import { listProducts, type Product } from "../api/products";
import { getCurrentUser, type MeUser } from "../api/auth";
import { useNavigate } from "react-router-dom";

export default function Products() {
  const [products, setProducts] = useState<Product[]>([]);
  const [user, setUser] = useState<MeUser | null>(null);
  const [loading, setLoading] = useState(true);
  const navigate = useNavigate();

  useEffect(() => {
    async function fetchData() {
      // Fetch products and user in parallel
      const [data, userData] = await Promise.all([
        listProducts(),
        getCurrentUser(),
      ]);
      setProducts(data);
      setUser(userData);
      setLoading(false);
    }
    fetchData();
  }, []);

  function logout() {
    localStorage.removeItem("access_token");
    navigate("/"); // Navigate to login page route
  }

  if (loading) return <h2>Loading products...</h2>;

  return (
    <div style={{ padding: "20px" }}>
      <div
        style={{
          display: "flex",
          justifyContent: "space-between",
          alignItems: "center",
        }}
      >
        <div>
          {user ? (
            <>
              <span style={{ marginRight: 16 }}>
                {user.FirstName} {user.LastName}
              </span>
              <button onClick={logout}>Logout</button>
              <br></br>
              <h2>Products</h2>
            </>
          ) : (
            <button onClick={logout}>Logout</button>
          )}
        </div>
      </div>
      <div style={{ display: "flex", flexWrap: "wrap", gap: "20px" }}>
        {products.map((p) => (
          <div
            key={p.ID}
            style={{
              border: "1px solid #ddd",
              padding: "15px",
              borderRadius: "8px",
              width: "200px",
            }}
          >
            <h4>{p.Name}</h4>
            <p style={{ fontSize: "14px", color: "#444" }}>{p.Description}</p>
            <button style={{ marginTop: "10px" }}>Add to Cart</button>
          </div>
        ))}
      </div>
    </div>
  );
}
