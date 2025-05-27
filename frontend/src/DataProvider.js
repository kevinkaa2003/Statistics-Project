import React, { createContext, useContext, useState } from 'react';

//Create Context
export const DataContext = createContext();

//Create Provider Element
export const DataProvider = ({children}) => {
    //Store Data from File Intereaction Component in Global Variable 
    const [globalGraphData, setGlobalGraphData] = useState();


    //Data Storage Variables
    const [xData, setXData] = useState();
    const [yData, setYData] = useState();
    const [zData, setZData] = useState();

    const [iData, setIData] = useState();
    const [jData, setJData] = useState();
    const [kData, setKData] = useState();

      
    //Variables to Store Selected Columns for Graph (CREATE EXPAND FEATURE)
    const [selectedColumnNameX, setSelectedColumnNameX] = useState("");
    const [selectedColumnNameY, setSelectedColumnNameY] = useState("");
    const [selectedColumnNameZ, setSelectedColumnNameZ] = useState("");


    //Data Indices Variable Storage
    const [dataIndices, setDataIndices] = useState();

    
    //Store Data in Global Variable
    const globalGraphDataStates = {

        //Global Graph Data
        globalGraphData,
        setGlobalGraphData,
        
        //Data Indices
        dataIndices,
        setDataIndices,

        //.obj Data States
        xData,
        setXData,
        yData,
        setYData,
        zData,
        setZData,

        iData,
        setIData,
        jData,
        setJData,
        kData,
        setKData,

        selectedColumnNameX,
        setSelectedColumnNameX,

        selectedColumnNameY,
        setSelectedColumnNameY,

        selectedColumnNameZ,
        setSelectedColumnNameZ,


        
    }


    return (<DataContext.Provider value ={globalGraphDataStates}>{/*Pass States to Children*/}
                {children}
            </DataContext.Provider>
    );  
};


