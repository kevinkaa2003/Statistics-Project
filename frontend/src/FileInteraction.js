import React, {useState, useEffect, createContext, useContext} from 'react';
//Styling
import './fileinteractioncomponent.css';
//Packages
import axios from 'axios'; //Backend Communication
import Papa from 'papaparse'; //CSV Reading
import { DataContext } from './DataProvider.js';

const FileInteractionComponent = () => {
  //Declare States Imported from Data Provider
  const { setGlobalGraphData } = useContext(DataContext);
  const { globalGraphData } = useContext(DataContext);

  const { xData } = useContext(DataContext);
  const { setXData } = useContext(DataContext);
  
  const { yData } = useContext(DataContext);
  const { setYData } = useContext(DataContext);
  
  const { zData } = useContext(DataContext);
  const { setZData } = useContext(DataContext);
  
  const { iData } = useContext(DataContext);
  const { setIData } = useContext(DataContext);

  const { jData } = useContext(DataContext);
  const { setJData } = useContext(DataContext);

  const { kData } = useContext(DataContext);
  const { setKData } = useContext(DataContext); 

  const { dataIndices } = useContext(DataContext);
  const { setDataIndices } = useContext(DataContext);


  const { graphName } = useContext(DataContext);
  const { setGraphName } = useContext(DataContext);

  const { selectedColumnNameX } = useContext(DataContext);
  const { setSelectedColumnNameX } = useContext(DataContext);

  
  const { selectedColumnNameY } = useContext(DataContext);
  const { setSelectedColumnNameY } = useContext(DataContext);

  
  const { selectedColumnNameZ } = useContext(DataContext);
  const { setSelectedColumnNameZ } = useContext(DataContext);
  





  //Declare File Handling States
  const [file, setFile] = useState(null);
  const [csvData, setCsvData] = useState([]);

  const handleFileChange = (event) => {
    const selectedFile = event.target.files[0];
    //Ensure Data is Present
    if (selectedFile) {
      
      setFile(selectedFile); //Store Selected File
      console.log("Selected File: ", selectedFile);

      Papa.parse(selectedFile, {
        complete: (result) => {
          setCsvData(result.data);
          console.log(result.data);
        },
        header: true,
        skipEmptyLines: true, 
      });
    }
     
  }
   
  //Listen for Data from Backend Processing 
  const [frontendDataColumns, setFrontendDataColumns] = useState([]); //Column Headers
  
  //Variables to Store Selected Columns (To POST to Backend) (CREATE EXPAND FEATURE)
  const [selectedColumnName1, setSelectedColumnName1] = useState("");
  const [selectedColumnName2, setSelectedColumnName2] = useState("");
  const [selectedColumnName3, setSelectedColumnName3] = useState("");

  
  
  //getColumn Headers Function
  const getColumnHeaders = async () => {
    
    axios.get("http://localhost:5000/api/data", {
      headers: {
        'X-Request-Type': 'get-column-headers' //Custom Header for get-column-header request
      } 
      })
      .then(response => {
        setFrontendDataColumns(response.data.data_columns); //Update State

        //Debug
        console.log("Columns Received: ", response.data.data_columns);
      })
      .catch(error => {
        console.log("Error receiving data: ", error);
      })
        
  } 

  //getIndices Function

  const getIndices = async () => {
    
    axios.get("http://localhost:5000/api/data", {
      headers: {
        'X-Request-Type': 'get-data-indices' //Custom Header for get-indices-header request
      }
    })
    .then(response => {
      setDataIndices(response.data.data_indices);
      
      //Debug
      console.log("Data Indices Received: ", response.data.data_indices);
    })
    .catch(error => {
      console.log("Error receiving data: ", error);
    })
  }
  
  //Set Default Selected Column Names Once frontendDataColumns is Updated
  useEffect( () => {
    if (frontendDataColumns.length > 0) {
      //Set Default Column Names
      setSelectedColumnName1(frontendDataColumns[0]);
      setSelectedColumnName2(frontendDataColumns[0]);
      setSelectedColumnName3(frontendDataColumns[0]);
      //Debug
      console.log("Default Column 1 Selected: ", selectedColumnName1);
      console.log("Default Column 2 Selected: ", selectedColumnName2);
      console.log("Default Column 3 Selected: ", selectedColumnName3);
    }
  }, [frontendDataColumns]);


  //Only Call Listen for Data Requests When CSV Files are Sent. MODIFY IN FUTURE FOR OTHER FILE TYPES???
  const [csvDataSent, setCsvDataSent] = useState(false)

  //Call getColumnHeaders and getIndices Functions Only When csvDataSent is "true".
  useEffect(() => {
    if (csvDataSent) { 

      getColumnHeaders(); 
      getIndices();

      console.log("Column Header Request Made.");
      console.log("Data Indices Request Made. ");
    } 
    }, [csvDataSent]); 

  //Upload File to Backend Server
  const uploadFile = () => {
    if (!file) {
      console.log("No file selected");
      return;
    }
    
    const formData = new FormData();
    formData.append("file", file); //Append the file to the FormData object
    
    //Send Data to Python Backend Server
    axios.post("http://localhost:5000/api/data", formData, {
      headers: {
        'X-Request-Type': 'upload-data'//Custom Header to Specify Request. MODIFY TO EXPAND FILE
      } 
    })
    .then(response => {
      console.log("Data Uploaded: ", response.data);
       //Sort Through JSON Response for .csv Case
      if (response.data["File Type"] == ".csv") {
        console.log(".csv Message Sent From Backend")
        //Only Set csvDataSent to true if Reponse from Backend
        setCsvDataSent(true);
      } 
      //Sort Through JSON Response for .obj Case. ADD MORE FUNCTIONALITY FOR FILE TYPE CHECK?
      else if (response.data["Uploaded Data"]["vertices"] && response.data["Uploaded Data"]["faces"] && response.data["File Type"] == ".obj") {
        //Retrieve Data for .obj Files and Sort Through Dictionary
        const vertices = response.data["Uploaded Data"]["vertices"] || {};
        const faces = response.data["Uploaded Data"]["faces"] || {};

        //Assign values to Axis Data
        setXData(vertices["x"] || []);
        setYData(vertices["y"] || []);
        setZData(vertices["z"] || []);

        setIData(faces["i"]);
        setJData(faces["j"]);
        setKData(faces["k"]);
        
        //Expand Functionality???
        setFrontendDataColumns(["X Data", "Y Data", "Z Data", "I Data", "J Data", "K Data"])
        //Debug
        console.log("Data Values from .obj File Set")
      }
      else {
        console.error("Response Not Processed.")
      }
    })
    .catch(error => {
      console.error("Error sending data: ", error);

    });
     
    console.log("Global Data Updated.");
    console.log("Data Sent to Backend Server");
    
  } 


  //Event Handlers for Selected Column Changes 

  const handleSelectChange1 = (event) => { 
    setSelectedColumnName1(event.target.value);
    setSelectedColumnNameX(event.target.value);
    console.log("Column 1 Selection Updated: ", event.target.value);
  }
  const handleSelectChange2 = (event) => { 
    setSelectedColumnName2(event.target.value);
    setSelectedColumnNameY(event.target.value);
    console.log("Column 2 Selection Updated: ", event.target.value);
  }
  const handleSelectChange3 = (event) => {
    setSelectedColumnName3(event.target.value);
    setSelectedColumnNameZ(event.target.value);
    console.log("Column 3 Selection Updated: ", event.target.value);
  }


  //Statistical Test Options
  const [selectedTest, setSelectedTest] = useState("");
  const[frontendPopMean, setFrontendPopMean] = useState(0); //Default Value for Population Mean to Test Against: One Sample T-Test
  const [shapiroMeanDialogBox, setShapiroMeanDialogBox] = useState();
  const [meanDialogBoxOpen, setMeanDialogBoxOpen] = useState(false); //Dialog Box Open Boolean Handler
  const statTestArray = ["Mean","Shapiro-Wilk Test", "One Sample T-Test", "Independent T-Test", "Chi-Squared Test of Independence", "One-Way ANOVA Test", "Two-Way ANOVA Test"];
  //Test Selection Handler
  const handleTestSelection = (event) => {
    setSelectedTest(event.target.value);
    console.log("Selected Test: ", event.target.value);
    if (event.target.value == "One Sample T-Test") {
      setMeanDialogBoxOpen(true); //Open The Dialog Box
      console.log("Population Mean Test");
    }
  }

  


  //Display Options From Backend
  const [selectedDisplay, setSelectedDisplay] = useState("")
  const displayArray = ["Q-Q Plot", "Histogram", "Box Plot", "Scatter Plot (With Regression)"];
  const [imageSrc, setImageSrc] = useState(null); //Store Display Image

  //Selected Display Handler
  const handleSelectedDisplay = (event) => {
    setSelectedDisplay(event.target.value);
    console.log("Selected Display: ", event.target.value);
  }

  //Display Data Function
  const displayData = () => {
    if (selectedColumnName1 && selectedColumnName2 && selectedDisplay) { 
      axios.post("http://localhost:5000/api/data", 
      {
        column1: selectedColumnName1,
        column2: selectedColumnName2,
        display: selectedDisplay
      }, 
      {
        headers: { //Custom Header to Specify Request
        'X-Request-Type': 'display-data-post'
        }
      })
      .then(response => {
        console.log("Display Received: ", response.data)
        if (response.data.Display) {
          setImageSrc(`data:image/png;base64,${response.data.Display}`);
          console.log("Image Source: ", imageSrc);
          const newWindow = window.open("", "_blank", "width = 1500, height = 1000");

          if (newWindow) { //Check if the window was successfully created
            newWindow.document.write(`
              <html>
                <head>
                  <title>Data Display</title>
                </head>
                <body>
                  <h1>Generated Plot</h1>
                  <img src="data:image/png;base64,${response.data.Display}" />
                </body>
              <html>
              `);
          }
          
        }
      })
      .catch(error => {
        console.log("Error Analyzing Data: ", error)
      })
  
  }}


  //P-Value and Test Statistic Holder
  const[testStatistic, setTestStatistic] = useState()
  const [pValue, setPValue] = useState()
  const [degreesOfFreedom, setDegreesOfFreedom] = useState()
  //Analyze Data Function

  const analyzeData = () => {
    if (selectedColumnName1 && selectedTest == "Mean") { //Mean
      axios.post("http://localhost:5000/api/data", 
      {
        column1: selectedColumnName1,
        column2: selectedColumnName2,
        column3: selectedColumnName3,
        test: selectedTest
      }, 
      {
        headers: { //Custom Header to Specify Request
        'X-Request-Type': 'analyze-data-post'
        }
      }
    )
      .then(response => {
        console.log("Selected Columns Sent", response.data)
      })
      .catch(error => {
        console.log("Error Analyzing Data: ", error)
      })
    }
    else if (selectedColumnName1 && selectedTest == "Shapiro-Wilk Test") { //Shapiro-Wilk Test
      axios.post("http://localhost:5000/api/data", 
      {
        column1: selectedColumnName1,
        column2: selectedColumnName2,
        column3: selectedColumnName3,
        test: selectedTest
      }, 
      {
        headers: { //Custom Header to Specify Request
        'X-Request-Type': 'analyze-data-post'
        }
      }
      )
         
      .then(response => {
        console.log("Request for Shapiro-Wilk Test Received", response.data)
        setTestStatistic(response.data["Test Statistic"])
        setPValue(response.data["P-Value"])
      })
      .catch(error => {
        console.log("Error Sending Data to be Analyzed: ", error)
      })

    }
    else if (selectedColumnName1 && frontendPopMean && selectedTest == "One Sample T-Test") { //One-Sample T-Test
      axios.post("http://localhost:5000/api/data", 
      {
        column1: selectedColumnName1,
        column2: selectedColumnName2,
        column3: selectedColumnName3,
        test: selectedTest,
        mean: frontendPopMean //Include Mean to Test Against

      }, 
      {
        headers: { //Custom Header to Specify Request
        'X-Request-Type': 'analyze-data-post'
        }
      }
    )
      .then(response => {
        console.log("Request for One Sample T-Test Received", response.data)
        setTestStatistic(response.data["Test Statistic"])
        setPValue(response.data["P-Value"])
        setDegreesOfFreedom(response.data["Degrees of Freedom"])
      })
      .catch(error => {
        console.log("Error Analyzing Data: ", error)
      })
    }
    else if (selectedColumnName1 && selectedColumnName2 && selectedTest == "Independent T-Test") { //Independent T-Test
      axios.post("http://localhost:5000/api/data", 
      {
        column1: selectedColumnName1,
        column2: selectedColumnName2,
        column3: selectedColumnName3,
        test: selectedTest
      }, 
      {
        headers: { //Custom Header to Specify Request
        'X-Request-Type': 'analyze-data-post'
        }
      }
      )
      .then(response => {
        console.log("Request for One Sample T-Test Received", response.data)
        setTestStatistic(response.data["Test Statistic"])
        setPValue(response.data["P-Value"])
      })
      .catch(error => {
        console.log("Error Analyzing Data: ", error)
      })
    }
    else if (selectedColumnName1 && selectedColumnName2 && selectedTest == "Chi-Squared Test of Independence") { //Chi-Squared Test of Indpendence 
      axios.post("http://localhost:5000/api/data", 
      {
        column1: selectedColumnName1,
        column2: selectedColumnName2,
        column3: selectedColumnName3,
        test: selectedTest
      }, 
      {
        headers: { //Custom Header to Specify Request
        'X-Request-Type': 'analyze-data-post'
        }
      }
    )
      .then(response => {
        console.log("Request for Chi-Squared Test of Independence Recevied", response.data)
        setTestStatistic()
        setPValue()
      })
      .catch(error => {
        console.log("Error Analyzing Data: ", error)
      })
    }
    else if (selectedColumnName1 && selectedColumnName2 && selectedColumnName3 && selectedTest == "One-Way ANOVA Test") { //One-Way ANOVA Test
      axios.post("http://localhost:5000/api/data", 
      {
        column1: selectedColumnName1,
        column2: selectedColumnName2,
        column3: selectedColumnName3,
        test: selectedTest
      }, 
      {
        headers: { //Custom Header to Specify Request
        'X-Request-Type': 'analyze-data-post'
        }
      }
    )
      .then(response => {
        console.log("Selected Columns Sent", response.data)
      })
      .catch(error => {
        console.log("Error Analyzing Data: ", error)
      })
    }
    else if (selectedColumnName1 && selectedTest == "Two-Way ANOVA Test") { //Two-Way ANOVA Test
      axios.post("http://localhost:5000/api/data", 
      {
        column1: selectedColumnName1,
        column2: selectedColumnName2,
        column3: selectedColumnName3,
        test: selectedTest
      }, 
      {
        headers: { //Custom Header to Specify Request
        'X-Request-Type': 'analyze-data-post'
        }
      }
    )
      .then(response => {
        console.log("Selected Columns Sent", response.data)
      })
      .catch(error => {
        console.log("Error Analyzing Data: ", error)
      })
    }
    else {
      console.log("Please select the appropriate test and data types.")
    }
  }


  

  //Variables to Store Data Retrieved From Backend. DEVELOP FURTHER TOOLS USING THESE VARIABLES???
  const [frontendColumnData1, setFrontendColumnData1] = useState();
  const [frontendColumnData2, setFrontendColumnData2] = useState();
  const [frontendColumnData3, setFrontendColumnData3] = useState();

  //Utilize useEffect() to Update the x, y, and z Data Variables of the Provider Component. (Allows the Component to Maintain the frontendColumnData Variables as Well.)
  useEffect(() => {
    setXData(frontendColumnData1); //Provider State
  }, [frontendColumnData1]);

  useEffect(() => {
    setYData(frontendColumnData2); //Provider State
  }, [frontendColumnData2]);

  useEffect(() => {
    setZData(frontendColumnData3); //Provider State
  }, [frontendColumnData3]);


  //Display Data Function
  const graphData = () => {

    //CREATE A CHECK FOR WHAT FILE TYPE HAS BEEN UPLOADED
    axios.post("http://localhost:5000/api/data", //Post Request to Return Column Data
      {
        column1: selectedColumnName1,
        column2: selectedColumnName2,
        column3: selectedColumnName3
      }, 
      {headers: { //Custom Header for Request
        "X-Request-Type" : "graph-data"
      }
      }
    )
    .then(response => { //Set Data Obtained From Response to frontendColumnData Variables**
      

      //Assign response Variables to Local Variables and Convert Graph Data to Arrays to Pass to Plot.
      
      if (response.data["Data Type for Column 1"] == "Number"){
      setFrontendColumnData1(response.data["Filtered Data for Column 1"].map(Number));
      
      }
      else if (response.data["Data Type for Column 1"] == "String") {
      setFrontendColumnData1(response.data["Filtered Data for Column 1"].map(String));
      
      };

      if (response.data["Data Type for Column 2"] == "Number") {
      setFrontendColumnData2(response.data["Filtered Data for Column 2"].map(Number));
      
      }
      else if (response.data["Data Type for Column 2"] == "String") {
      setFrontendColumnData2(response.data["Filtered Data for Column 2"].map(String));
     
      };
      
      if (response.data["Data Type for Column 3"] == "Number") {
      setFrontendColumnData3(response.data["Filtered Data for Column 3"].map(Number));
      
      }
      else if (response.data["Data Type for Column 3"] == "String") {
      setFrontendColumnData3(response.data["Filtered Data for Column 3"].map(String));
      
      }



      
      console.log("Response Received: ", response.data); //Debug To Ensure Data is Received

    })
    .catch(error => {
      console.log("Error Analyzing Data: ", error)
    })
    
  }





  // Buttons and Data Columns
  return (
  <>
  <div className = "masterparentcontainer">
    <div className = "fileinteraction"> 
      <div className='fileinteractionbtns'>
        <h3> 
          File Interaction:
        </h3>
        <br/>
        <input 
          className = "filePath" 
          type = "file" 
          onChange = {handleFileChange}></input>
        <br/>
        <br/>
        <button 
          className = "uploadfilebtn" 
          type = "button" 
          title = "Upload File" 
          onClick = {uploadFile}>
            Upload
        </button>
        <br/>
        <br/>
        <button 
          className = "analyzefilebtn" 
            type = "button" 
            title = "Analyze File" 
            onClick = {() => analyzeData()}>
              Analyze
            </button>
            <br/>
            <br/>
        <button
          className = "displaybtn"
          type = "button"
          title = "Display Data"
          onClick = {() => graphData()}>
          Graph Data
        </button>
        <br/>
        <br/>
        <br/>
        <br/>
      </div>
    </div>
    <hr/>
    <div className = "datacolumns"> {/*Create a Column Interaction Component and Pass Variables to it*/}
      <h3>
        Data Selection: 
      </h3>
      <br/>
      <h3>
        X Data: 
      </h3>
        <select 
        name = "columnselect1" 
        className = "columnselect1" 
        onChange = {handleSelectChange1} 
        value = {selectedColumnName1}> {/*Bind Value to selectedColumnName1 */}
          {frontendDataColumns.map((item, index) => (
          <option key = {index} value = {item}>{item}</option>
          ))}
        </select>
      <h3>
        Y Data: 
      </h3>
      <select 
      name = "columnselect2" 
      className = "columnselect2" 
      onChange = {handleSelectChange2}
      value = {selectedColumnName2}> {/*Bind Value to selectedColumnName2 */}
          {frontendDataColumns.map((item, index) => (
          <option key = {index} value = {item}>{item}</option>
          ))}
        </select>
      <h3>
        Z Data: 
      </h3>
      <select 
      name = "columnselect3" 
      className = "columnselect3" 
      onChange = {handleSelectChange3}
      value = {selectedColumnName3}> {/*Bind Value to selectedColumnName3 */}
          {frontendDataColumns.map((item, index) => (
          <option key = {index} value = {item}>{item}</option>
          ))}
          
        </select>
    </div>
    <br/>
    <hr/>
    <br/>
    <div className = "testselection">
      <h3>
        SELECT A TEST:
      </h3>
      <select name = "stattests" className = "statTests" onChange = {handleTestSelection}> 
        {statTestArray.map((test, index) => (
          <option key = {index} value = {test}>{test}</option>
        ))}
      </select>
      { meanDialogBoxOpen && (
        <dialog open>
          <label>
            Enter a Mean to Test Against: 
            <input
              type = "number"
              step ="any"
              onChange = {(e) => {
                setFrontendPopMean(parseFloat(e.target.value));
                console.log("Test Population Mean Updated");
              }}
              required
              >
              </input>
              <button onClick = {() => {
                setMeanDialogBoxOpen(false);
                console.log("Test Mean Selected: ", frontendPopMean);
                }}>
                Submit
              </button>
            </label>
        </dialog>
      )}
    </div>
    <br/>
    <hr/>
    <br/>
    <div className = "testdata">
      <h3>
        TEST DATA:
      </h3>
      <br/>
      <p>
        <h4>
          TEST-STATISTIC: {testStatistic}
          <br/>
          <br/>
          P-VALUE: {pValue}
          <br/>
          <br/>
          DEGREES OF FREEDOM: 
        </h4>
      </p>

    </div>
    <br/>
    <hr/>
    <br/>
    <div className = "displaydata">
      <h3>
        SELECT A DISPLAY: 
      </h3>
      <select name = "displays" className = "displays" onChange = {handleSelectedDisplay}>
        {displayArray.map((display, index) => (
          <option key = {index} value = {display}>{display}</option>
        ))}
      </select>
      <br/>
      <br/>
      <button onClick={displayData}>{/*Create Display Data Function*/}
        DISPLAY DATA
      </button>
      <br/>
    </div>
  </div>
  </>
  );
    

}
 
export default FileInteractionComponent;