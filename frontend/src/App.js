import './App.css';
import React, { useEffect, useState, createContext, useContext } from 'react';
import FileInteractionComponent from './FileInteraction.js';
import ThreeDEnvironment from './3DEnvironment.js';
import Navbar from './StatisticsNavbar.js';
import { DataProvider } from './DataProvider.js';


function App() {

  return (
    <>
    <DataProvider>
    <div className='navbar'>
        <Navbar/>
    </div>
    <div className='maincontainer'>
       {/*Wrapper that Makes Data Available to any Nested Components Within Its Tree */}
        <div className='fileinteraction'>
          <FileInteractionComponent/>
        </div>

        <div className='threedenvironment'>
          <ThreeDEnvironment/>
        </div>
    </div>
    </DataProvider>
    </>
  )
}



export default App;
