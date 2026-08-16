import Tick from "../../assets/icons/tick.svg"
import Shield from "../../assets/icons/shield.svg"
import Flower from '../../assets/icons/flower.svg'
import Track from "../../assets/icons/track1.svg"
import "./Feature.css"

function Feature() {
    return (
        <div className="container my-3">
            <div className="d-flex justify-content-around align-items-center feature-items mt-1 mb-3">
                <div className="text-center">
                    <img src={Tick} alt="tick" className="mb-2"></img>
                    <span className="d-block feature-title">100% Original</span>
                    <span className="d-block feature-sub">Certified product quality</span>
                </div>
                <div className="text-center">
                    <img src={Shield} alt="shield" className="mb-2"></img>
                    <span className="d-block feature-title">Secure Payments</span>
                    <span className="d-block feature-sub">PCI DSS compliant</span>
                </div>
                <div className="text-center">
                    <img src={Flower} alt="flower" className="mb-2"></img>
                    <span className="d-block feature-title">Easy Returns</span>
                    <span className="d-block feature-sub">07-day hassle-free</span>
                </div>
                <div className="text-center">
                    <img src={Track} alt="track" className="mb-2"></img>
                    <span className="d-block feature-title">Free Delivery</span>
                    <span className="d-block feature-sub">Orders over 499</span>
                </div>
            </div>
        </div>


    );
};

export default Feature;