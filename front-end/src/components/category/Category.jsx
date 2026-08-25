import React from "react";
import { useData } from "../../context/DataContext";
import { Link } from "react-router-dom";
import "./Category.css";

import Watch from "../../assets/images/watch.svg";
import Shoe from "../../assets/images/shoe.svg";
import Buds from "../../assets/images/Buds.png";
import Cap from "../../assets/images/cap.png";


export default function Category() {
    const { categories, loading } = useData();

    if (loading) {
        return (
            <div className="container text-center py-5">
                <div className="spinner-border text-warning" role="status">
                    <span className="visually-hidden">Loading categories...</span>
                </div>
            </div>
        );
    }


    const categoryImages = {
        "Watches": Watch,
        "Accessories": Watch,
        "Gadgets": Buds,
        "Fashion & Bags": Cap,
        "Die-Cast Cars": Shoe,
        "Footwear": Shoe,
        "Clothing": Cap,
        "Electronics & Cameras": Buds,
    };

    const categoryClasses = {
        "Watches": "watch-card",
        "Accessories": "watch-card",
        "Gadgets": "buds-card",
        "Fashion & Bags": "cap-card",
        "Die-Cast Cars": "shoes-card",
        "Footwear": "shoes-card",
        "Clothing": "cap-card",
        "Electronics & Cameras": "buds-card",
    };

    const categorySlugs = {
        "Watches": "watches",
        "Accessories": "accessories",
        "Gadgets": "gadgets",
        "Fashion & Bags": "fashion-bags",
        "Die-Cast Cars": "die-cast-cars",
        "Footwear": "footwear",
        "Clothing": "clothing",
        "Electronics & Cameras": "electronics-cameras",
    };


    return (
        <div className="container category-section mb-4">

            <div className="category-header">

                <span className="category-tagline">
                    Explore Collection
                </span>

                <h2 className="category-heading">
                    Our Category
                </h2>

            </div>


            <div className="category-grid">

                {categories.map((category) => (

                    <div
                        key={category.id}
                        className={`category-card ${categoryClasses[category.name] || ""}`}
                    >

                        <div className="category-info">

                            <h4>
                                {category.name}
                            </h4>

                            <Link
                                to={`/products/${categorySlugs[category.name] || category.name
                                    .toLowerCase()
                                    .replace(/\s+/g, "-")}`}
                                className="explore-btn"
                                style={{ textDecoration: "none" }}
                            >
                                Explore Now
                            </Link>

                        </div>


                        <div className="category-img-container">

                            <img
                                src={categoryImages[category.name] || Watch}
                                alt={category.name}
                                className="category-img"
                            />

                        </div>

                    </div>

                ))}

            </div>

        </div>
    );
}