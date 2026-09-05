import React from "react";
import { render, screen, fireEvent } from "@testing-library/react";
import "@testing-library/jest-dom";
import CustomerTestimonials from "./CustomerTestimonials";

describe("CustomerTestimonials Component", () => {
  it("renders the heading, 3 testimonial cards, and nav buttons on desktop", () => {
    render(<CustomerTestimonials />);

    expect(screen.getByText("Customers are saying us?")).toBeInTheDocument();

    const prevBtn = screen.getByRole("button", { name: /previous testimonial/i });
    const nextBtn = screen.getByRole("button", { name: /next testimonial/i });
    expect(prevBtn).toBeInTheDocument();
    expect(nextBtn).toBeInTheDocument();

    // Check visible cards
    const customerNames = screen.getAllByRole("heading", { level: 3 });
    expect(customerNames.length).toBeGreaterThanOrEqual(3);
  });

  it("navigates through testimonials when next and prev buttons are clicked", () => {
    render(<CustomerTestimonials />);

    const nextBtn = screen.getByRole("button", { name: /next testimonial/i });
    const prevBtn = screen.getByRole("button", { name: /previous testimonial/i });

    // Initial first card
    expect(screen.getByText("Aarav Sharma")).toBeInTheDocument();

    // Click next
    fireEvent.click(nextBtn);
    expect(screen.getByText("Rohan Kapoor")).toBeInTheDocument();

    // Click prev
    fireEvent.click(prevBtn);
    expect(screen.getByText("Aarav Sharma")).toBeInTheDocument();
  });
});
