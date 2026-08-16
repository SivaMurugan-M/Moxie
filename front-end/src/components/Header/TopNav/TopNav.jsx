import Simplification from "../../../assets/icons/Simplification.svg";
import Track from "../../../assets/icons/track.svg";
import Box from "../../../assets/icons/box.svg";
import Help from "../../../assets/icons/help.svg";
import "./TopNav.css";
function TopNav() {
    return (
        <div id="top-menu">
            <div className="container d-flex justify-content-between">
            <div className="d-flex align-items-center">
                <img
                    src={Simplification}
                    alt="simplification"
                    width="14"
                    height="14"
                />
                <p className="mb-0 ms-2">Smarter Choices, Better Life</p>
            </div>
            <div className="d-flex align-items-center gap-4">
                <div className="d-flex align-items-center">
                    <img
                        src={Track}
                        alt="Track"
                        width="14"
                        height="14"
                    />
                    <p className="mb-0 ms-2">Free Shipping on orders above ₹999</p>
                </div>
                <div className="d-flex align-items-center">
                    <img
                        src={Box}
                        alt="Box"
                        width="14"
                        height="14"
                    />
                    <p className="mb-0 ms-2">TRACK ORDER</p>
                </div>
                <div className="d-flex align-items-center">
                    <img
                        src={Help}
                        alt="Help"
                        width="14"
                        height="14"
                    />
                    <p className="mb-0 ms-2">HELP & SUPPORT</p>
                </div>

            </div>
        </div>
        </div>
        
    );
}

export default TopNav;