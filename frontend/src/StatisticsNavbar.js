import React, { useState, useEffect } from 'react';
import './StatisticsNavbar.css';

//Navbar component
const Navbar = () => {
    //Declare variables
    const[isInputFocused, setIsInputFocused] = useState(false);
    const searchBar = document.getElementById('searchbar');
    const searchResultsDiv = document.getElementById('search-results');


    //About Section Displays
    useEffect( () => {

        const dropdownHistory = document.getElementsByClassName('dropdownhistory')[0];
        const dropdownGoals = document.getElementsByClassName('dropdowngoals')[0];
        const history = document.getElementsByClassName('history')[0];
        const goals = document.getElementsByClassName('goals')[0];

        //Show Dropdown Function

        function showDropdown(dropdown) {
            dropdown.style.display = 'block';
            dropdown.classList.add('expand-height');
        };

        //Hide Dropdown Function

        function hideDropdown(dropdown) {
            dropdown.style.display = 'none';
            dropdown.classList.remove('expand-height');
        };

        //Hide All Dropdowns Initially
        hideDropdown(dropdownHistory);
        hideDropdown(dropdownGoals);

        //Event Listeners for Headers
        history.addEventListener('mouseenter', function () {
            showDropdown(dropdownHistory);
        });

        history.addEventListener('mouseleave', function () {
            hideDropdown(dropdownHistory);

        });

        goals.addEventListener('mouseenter', function () {
            showDropdown(dropdownGoals);
        });

        goals.addEventListener('mouseleave', function () {
            hideDropdown(dropdownGoals);
        });

        return function() {

            //Add event listeners
            history.removeEventListener('mouseenter', showDropdown);
            history.removeEventListener('mouseleave', hideDropdown);

            goals.removeEventListener('mouseenter', showDropdown);
            goals.removeEventListener('mouseleave', hideDropdown);
        };

    });

    return (

        <>
        <div className="navbar">
            <a href=""><img src="" style={{verticalAlign: 'middle'}}/></a>{/*Logo or Header Image*/}
            <div className="dropdownproducts">
                <img src="" style={{width: '25px', height: '25px', verticalAlign: 'middle'}}/>
                <strong>SUMMIT GRAPHING</strong>
            </div>
            <div className= 'navright'>
                <div className="dropdownabout">
                    <strong>ABOUT</strong>
                    <div className="dropdown-content-about">
                        <br/>
                        <br/>
                        <br/>
                        <br/>
                        <div className="history">History</div>
                            <div className="dropdownhistory">
                                <strong>Founded by a solo developer in 2024, Summit Graphing is in its infancy and will continue to be developed throughout the years to improve performance while also adding additional features.</strong>
                            </div>
                        <br/>
                        <br/>
                        <br/>
                        <br/>
                        <div className="goals">Goals</div>
                            <div className="dropdowngoals">
                                <strong>
                                    Our Goals as a company are as follows:
                                    <br/>
                                    <br/>
                                <ul>
                                    <li>
                                        Continue providing free access to use our web application.
                                    </li>
                                    <br/>
                                    <li>
                                        Enhance our application by adding additional features that fit the demands of our users.
                                    </li>
                                    <br/>
                                    <li>
                                        Maintain an error free system that produces reliable and consistent results.
                                    </li>
                                    <br/>
                                    <li>
                                        Transition to an A.I. dependent system to bolster a user-friendly environment.
                                    </li>
                                    <br/>
                                    <li>
                                        Listen to feedback from our users to help improve our product for the future.
                                    </li>
                                </ul>
                                </strong>
                            </div>
                        </div>
                    </div>
                <div className="dropdowncontact"> {/*Create Links to each social media and list phone,email, and office location in DIV*/}
                <strong>CONTACT/HELP</strong>
                    <div className="dropdown-content-contact">
                        <br/>
                        <strong>E-mail:</strong> summitgraphing@gmail.com
                        <br/>
                        <br/>
                        <a href="#" className="facebooknav">Facebook</a>
                        <a href="#" className="twitternav">Twitter</a>
                        <a href="#" className="instagramnav">Instagram</a>
                    </div>
                </div>
            </div>
        </div>
        </>

     );
}

export default Navbar;
