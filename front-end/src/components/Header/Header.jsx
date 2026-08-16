import React from "react";
import Logo from "./Logo/Logo";
import SearchBar from "./SearchBar/SearchBar";
import NavMenu from "./NavMenu/NavMenu";
import TopNav from "./TopNav/TopNav";
import NavBottom from "./NavBottom/NavBottom";
import "./Header.css";

function Header({ searchQuery, setSearchQuery }) {
  return (
    <>
      <TopNav />
      <div className="container">
        <div className="header">
          <Logo />
          <SearchBar searchQuery={searchQuery} setSearchQuery={setSearchQuery} />
          <NavMenu />
        </div>
      </div>
      <NavBottom />
    </>
  );
}

export default Header;
