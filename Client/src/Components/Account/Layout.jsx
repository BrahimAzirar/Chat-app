import { Link } from "react-router-dom";

export default function NavBar() {
  return (
    <div id="NavBar" className="col-2 h-100">
      <ul className="pt-3 d-flex flex-column align-items-center">
        <li className="mb-5">
          <Link to="/Account/members">
            <img src="/Logo.svg" />
          </Link>
        </li>
        <li className="mb-5">
          <Link to="/Account/members">
            <img src="/user-regular 1.svg" />
          </Link>
        </li>
        <li className="mb-5">
          <Link to="/Account/friends">
            <img src="/comment-regular 1.svg" />
          </Link>
        </li>
        <li className="mb-5">
          <Link to="/Account">
            <img src="/bell-regular 1.svg" />
          </Link>
        </li>
        <li className="mb-5">
          <Link to="/Account">
            <img src="/gear-solid 1.svg" />
          </Link>
        </li>
        <li className="mb-5">
          <Link to="/Account">
            <img src="/download 1.png" />
          </Link>
        </li>
      </ul>
    </div>
  );
}
