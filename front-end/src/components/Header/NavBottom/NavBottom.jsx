import { Link } from "react-router-dom";
import "./NavBottom.css";

function NavBottom() {
  return (
    <div className="bottom-items">
      <ul className="bottom-menu">
        <li><Link to="/">Home</Link></li>
        <li><Link to="/products/watches">Watches</Link></li>
        <li><Link to="/products/shoes">Shoes</Link></li>
        <li><Link to="/products/air-buds">Air Buds</Link></li>
        <li><Link to="/products/sliders">Sliders</Link></li>
        <li><Link to="/products/caps">Caps</Link></li>
        <li><Link to="/products/accessories">Accessories</Link></li>
        <li><Link to="/products/deals">Deals</Link></li>
      </ul>
    </div>
  );
}

export default NavBottom;