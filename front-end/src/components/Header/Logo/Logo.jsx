import { Link } from "react-router-dom";
import Moxie from "../../../assets/logo/moxie.png";

function Logo() {
  return (
    <Link to="/" style={{ cursor: "pointer", display: "inline-block" }}>
      <img
        src={Moxie}
        alt="Moxie Logo"
        width="108"
        height="88"
      />
    </Link>
  );
}

export default Logo;