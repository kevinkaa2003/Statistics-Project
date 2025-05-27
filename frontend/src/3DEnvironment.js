import React from 'react';
import './3DEnvironment.css'; //Styling
import { useState, useEffect, createContext, useContext } from 'react';
import Plot from 'react-plotly.js';
import Papa from 'papaparse'; 
import { DataContext } from './DataProvider.js';

const ThreeDEnvironment = () => {
    
    //Declare States Imported from Data Provider
    const { setGlobalGraphData } = useContext(DataContext);
    const { globalGraphData } = useContext(DataContext);

    //Data Variables
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

    const { selectedColumnNameX } = useContext(DataContext);
    const { setSelectedColumnNameX } = useContext(DataContext);

    const { selectedColumnNameY } = useContext(DataContext);
    const { setSelectedColumnNameY } = useContext(DataContext);

    const { selectedColumnNameZ } = useContext(DataContext);
    const { setSelectedColumnNameZ } = useContext(DataContext);

    
    const { graphName } = useContext(DataContext);//Not Needed???
    const { setGraphName } = useContext(DataContext);//Not Needed???
    
    //Debug
    console.log("Selected Graph X Data:", xData);
    console.log("Selected Graph Y Data: ", yData);
    console.log("Selected Graph Z Data: ", zData);
    console.log("Selected Graph I Data: ", iData);
    console.log("Selected Graph J Data: ", jData);
    console.log("Selected Graph K Data: ", kData);

    
    
    //Plot Options

    const plotOptionsArray = ["3D Scatter Plot", "2D Scatter Plot", "2D Line Plot", "3D Line Plot", "2D Bar Plot", "Mesh3D", "Heat Map", "Contour Plot", "2D Histogram Heatmap", "2D Histogram Contour"];
    
    //State for Selected Plot
    const [selectedPlot, setSelectedPlot] = useState();
    
    //2D Array Variable for Heat Map
    const heatMapData = [xData, yData, zData]


    const plotOptionsHandler = (event) => {
        setSelectedPlot(event.target.value)
        console.log("Selected Plot Updated: ", event.target.value)
    };

     /*Conditional Rendering of Graph Given Data*/
  
    const plotHandler = (xData, yData, zData, iData, jData, kData, plot) => {
        if (xData && yData && zData && iData && jData && kData && plot == "Mesh3D") { //Mesh3D
            return (
                <>
                <Plot
                    data = {[
                        {
                            type: 'mesh3d', // specify the Plot Type    
                            
                            x: xData, // x=axis values
                            
                            y: yData, // y-axis values
                            
                            z: zData,  // z-axis values

                            //Triangle faces
                            i: iData, //i values

                            j: jData, //j values

                            k: kData, //k values
                            
                            color: 'red', //Color of Model
                            
                            opacity: 1.0, //Face Opacity

                            name: '3D Mesh Model',
                            hoverinfo: 'x+y+z',
                            lighting: {
                                ambient: 0.1,
                                diffuse: 0.7,
                                specular: 0.8,
                                roughness: 0.3
                            },
                            lightposition: {
                                x: 100, //x Light Source Position
                                y: 100, // y Light Source Position
                                z: 100, // z Light Source Position
                            }   
                           
                            }
                        
            
                    ]}
            
                    layout = {{
                        title: '3D MESH TEST',
                        
                        scene: { //Define the 3D scene
                            xaxis: { title: selectedColumnNameX},
                            yaxis: { title: selectedColumnNameY},
                            zaxis: { title: selectedColumnNameZ}
            
            
                        },
            
                        margin: { l: 0, r: 0, b: 0, t: 0 },
                        
                        width: 1000, //Width of the Plot
            
                        height: 700, //Height of the Plot

                        hoverinfo: 'x+y+z',

                        //Legend: ???
                        showlegend: true,
                        legend: { x: 0.1, y: 1.0}
    
            
                    }}
                />
                <h3>
                    <p>3D Mesh Plot for Selected Data</p>
                </h3>
                </>
                )
        }
        else if (xData && yData && plot == "2D Scatter Plot") { //2D Scatter Plot.
            return (
                <>
                    <Plot
                        data = {[
                            {
                            x: xData, // x=axis values
                            
                            y: yData, // y-axis values
                            
                            mode: 'markers', //marker mode for a scatter plot
                            
                            marker: {
                                size: 9,
                                color: 'rgba(100, 100, 100, 1.0)', // Color
                                line: {
                                    color: 'rgb(0,0,0),',
                                    width: 0.5
                                }
                            },
                            
                            type: 'scatter' // specify the 3D scatter plot type
                            
                            }
                        ]}
    
                        layout = {{
                            title: '2D Scatter Plot Title TEST',
                            
                            scene: { //Define the 3D scene
                                xaxis: { title: selectedColumnNameX},
                                yaxis: { title: selectedColumnNameY}
                             
    
    
                            },
    
                            margin: { l: 0, r: 0, b: 0, t: 0 },
                            
                            width: 1000, //Width of the Plot
    
                            height: 700, //Height of the Plot

                            hoverinfo: 'x+y',

                            //Legend
                            showlegend: true,
                            legend: { x: 0.1, y: 1.0}
    
    
                        }}
                    />
                    <h3>
                        <p>2D Scatter Plot for Selected Data</p>
                    </h3>
                </>
            )
        }
        else if (xData && yData && zData/*Remove?*/ && plot == "2D Line Plot") { //2D Line Plot. EXPAND FUNCTIONALITY TO ACCOMODATE MORE DATA/LINES
            return (
                <>
                <Plot
                    data = {[
                        {
                            type: 'scatter', // Specify the Plot Type    
                            
                            x: xData, // x-axis values
                            
                            y: yData, // y-axis values
                            

                            mode: 'lines'+'markers', //Draw Lines and Markers

                            marker: { //Data Points
                                size: 9,
                                color: 'rgba(100, 100, 100, 1.0)', 
                            
                            },
                            line: { //Line to Plot
                                color: 'red',
                                width: 0.5
                            },
                    
                            name: '2D Line Plot',
                            hoverinfo: 'x+y',
                           
                        }
                        
            
                    ]}
            
                    layout = {{
                        title: '2D LINE PLOT TEST',
                        hoverinfo: 'x+y',
                        scene: { //Define the 3D scene
                            xaxis: { title: selectedColumnNameX},
                            yaxis: { title: selectedColumnNameY},
                            zaxis: { title: selectedColumnNameZ}
            
            
                        },
            
                        margin: { l: 0, r: 0, b: 0, t: 0 },
                        
                        width: 1000, //Width of the Plot
            
                        height: 700, //Height of the Plot

                        hoverinfo: 'x+y',

                        //Legend
                        showlegend: true,
                        legend: { x: 0.1, y: 1.0}
    
            
                    }}
                />
                <h3>
                    <p>2D Line Plot for Selected Data</p>
                </h3>
                </>
            )
        } 
        else if (xData && yData && zData && plot == "3D Line Plot") { //3D Line Plot. ADD MORE DATA COLUMNS TO ENABLE MULTIPLE LINES
            return (
                <>
                    <Plot
                        data = {[
                            {
                            x: xData, // x=axis values
                            
                            y: yData, // y-axis values
                            
                            z: zData,  // z-axis values
                            
                            mode: 'lines'+'markers', //marker mode for a scatter plot
                            line: {
                                color: 'red',
                                width: 1.0, 
                            },
                            marker: {
                                size: 9,
                                color: 'rgba(100, 100, 100, 1.0)', // Color
                                
                            },
                            
                            type: 'scatter3d' // specify the 3D scatter plot type
                            
                            }
                        ]}
    
                        layout = {{
                            title: '3D Scatter Plot Title TEST',
                            
                            scene: { //Define the 3D scene
                                xaxis: { title: selectedColumnNameX},
                                yaxis: { title: selectedColumnNameY},
                                zaxis: { title: selectedColumnNameZ}
    
    
                            },
    
                            margin: { l: 0, r: 0, b: 0, t: 0 },
                            
                            width: 1000, //Width of the Plot
    
                            height: 700, //Height of the Plot
                            
                            hoverinfo: 'x+y+z',

                            //Legend
                            showlegend: true,
                            legend: { x: 0.1, y: 1.0}
                        }}
                    />
                    <h3>
                        <p>3D Line Plot for Selected Data</p>
                    </h3>
                </>
            )
        }
        else if (xData && yData && zData && plot == "3D Scatter Plot") {    //3D Scatter Plot
            return (
                <>
                    <Plot
                        data = {[
                            {
                            x: xData, // x=axis values
                            
                            y: yData, // y-axis values
                            
                            z: zData,  // z-axis values
                            
                            mode: 'markers', //marker mode for a scatter plot
                            
                            marker: {
                                size: 9,
                                color: 'rgba(100, 100, 100, 1.0)', // Color
                                
                            },
                            
                            type: 'scatter3d' // specify the 3D scatter plot type
                            
                            }
                        ]}
    
                        layout = {{
                            title: '3D Scatter Plot Title TEST',
                            
                            scene: { //Define the 3D scene
                                xaxis: { title: selectedColumnNameX},
                                yaxis: { title: selectedColumnNameY},
                                zaxis: { title: selectedColumnNameZ}
    
    
                            },
    
                            margin: { l: 0, r: 0, b: 0, t: 0 },
                            
                            width: 1000, //Width of the Plot
    
                            height: 700, //Height of the Plot

                            hoverinfo: 'x+y+z',

                            //Legend
                            showlegend: true,
                            legend: { x: 0.1, y: 1.0}
    
    
                        }}
                    />
                    <h3>
                        <p>3D Scatter Plot for Selected Data</p>
                    </h3>
                </>
            )
        }
        else if (xData && yData && plot == "2D Bar Plot") { //2D Bar Plot. ADD MORE COLUMNS FOR MORE DATA ACCOMODATION
            return(
                <>
                    <Plot 
                        data = {[
                            {
                                x: xData, //x-axis Category values

                                y: yData, //y-axis values

                                type: 'bar', //Plot Type
                                
                                name: 'Selected Data', //Name for Legend

                                marker: {
                                    color: 'rgba(100, 100, 100, 1.0)', // Color
                                    
                                },
                                
                            }                               
                        ]} 
                        layout = {{
                            title: '2D Bar Plot',
                                    
                            xaxis: { 
                                title: selectedColumnNameX 
                            
                            },
                            yaxis: { 
                                title: selectedColumnNameY
                            
                            },

                            margin: { l: 0, r: 0, b: 0, t: 0 },
                            
                            width: 1000, //Width of the Plot

                            height: 700, //Height of the Plot

                            hoverinfo: 'x+y', 

                            barmode: 'group', //Bar Display
                            //Legend
                            showlegend: true,
                            legend: {x: 0.1, y: 1.0}
                                    
                        }}
                    
                    />
                    <h3>
                        2D Bar Plot for Selected Data
                    </h3>
                </>
            )
        }
        else if (heatMapData && xData && yData && plot == "Heat Map") { //Heat Map.
            return (
                <>
                    <Plot
                        data = {[
                            {
                            z: heatMapData, //Heatmap Intensity Values
                            
                            x: xData, //x-axis labels
                            
                            y: yData, //y-axis labels
                    
                            colorscale: [
                                [0, "rgb(68, 1, 84)"],
                                [0.25, "rgb(72, 35, 116)"],
                                [0.5, "rgb(49, 104, 142)"],
                                [0.75, "rgb(34, 168, 132)"],
                                [1, "rgb(253, 231, 37)"]
                            ], // Custom colorscale
                            
                            type: 'heatmap', // Specify the 3D scatter plot type
                            hoverongaps: false, //improves tooltip behavior
                            showscale: true, //Display color scale
                            }
                        ]}
    
                        layout = {{

                            annotations: [ //DEBUG???
                                {
                                    x: selectedColumnNameX,
                                    y: selectedColumnNameY,
                                    z: selectedColumnNameZ,
                                    text: "Value", 
                                    showarrow: true, 
                                    font: { size: 12, color: "black" },

                                }
                            ],

                            title: 'Heat Map TEST',
                            
                            scene: { //Define the 3D scene
                                xaxis: { title: selectedColumnNameX},
                                yaxis: { title: selectedColumnNameY}
                             
    
    
                            },
                            
                            margin: { l: 0, r: 0, b: 0, t: 0 },
                            
                            width: 1000, //Width of the Plot
    
                            height: 700, //Height of the Plot

                            

                            //Legend
                            showlegend: true,
                            legend: { x: 0.1, y: 1.0}
    
    
                        }}
                    />
                    <h3>
                        <p>Heat Map for Selected Data</p>
                    </h3>
                </>
            )
        }
        else if (xData && yData && plot == "Contour Plot") { //Contour Plot.
            return (
                <>
                    <Plot
                        data = {[
                            {
                            z: heatMapData, //Heatmap Intensity Values
                            
                            x: xData, //x-axis labels
                            
                            y: yData, //y-axis labels
                    
                            colorscale: "Jet", // Customize colorscale??
                            contours: {
                                coloring: "heatmap", //Fill color between lines
                                showlabels: true, //Show contour labels
                                labelfont: {
                                    size: 12, 
                                    color: "white"
                                }
                            },
                            line: {
                                smoothing: 0.85 //Smooth contour lines
                            },

                            type: 'contour', // Specify the Contour plot type
                           
                            }
                        ]}
    
                        layout = {{

                            annotations: [ //DEBUG???
                                {
                                    x: selectedColumnNameX,
                                    y: selectedColumnNameY,
                                    z: selectedColumnNameZ,
                                    text: "Value", 
                                    showarrow: true, 
                                    font: { size: 12, color: "black" },

                                }
                            ],

                            title: 'Contour Plot TEST',
                            
                            xaxis: { title: selectedColumnNameX, automargin: true}, //X-axis title
                            yaxis: { title: selectedColumnNameY, automargin: true}, //Y-axis title
                            
                            margin: { l: 0, r: 0, b: 0, t: 0 },
                            
                            width: 1000, //Width of the Plot
    
                            height: 700, //Height of the Plot

                            

                            //Legend
                            showlegend: true,
                            legend: { x: 0.1, y: 1.0}
    
    
                        }}
                    />
                    <h3>
                        <p>Contour Plot for Selected Data</p>
                    </h3>
                </>
            )
        } else if (xData && yData && plot == '2D Histogram Heatmap') {
            return (
            <>
                <Plot
                    data = {[
                        {
                            x: xData, //X-axis data
                            y: yData, //Y-axis data
                            type: 'histogram2d', //Plot type
                            colorscale: 'Viridis', //Color Scheme
                        }
                    ]}
                    layout = {{
                        xaxis: { title: selectedColumnNameX },
                        yaxis: { title: selectedColumnNameY },
                        width: 1000, 
                        height: 700,
                    }}
                
            
                />
                <h3>
                    <p>2D Histogram Heatmap for Selected Data</p>
                </h3>
            </>
        )} else if (xData && yData && plot == '2D Histogram Contour'){
            return (
            <>
                <Plot
                    data = {[
                        {
                            x: xData, //X-axis data
                            y: yData, //Y-axis data
                            type: 'histogram2dcontour', //Plot type
                            colorscale: 'Jet', //Color Scheme
                            contours: {
                                coloring: 'heatmap', //Coloring type (can be 'heatmap', 'lines', or 'none')
                            }
                        }
                    ]}
                    layout = {{
                        xaxis: { title: selectedColumnNameX },
                        yaxis: { title: selectedColumnNameY },
                        width: 1000,
                        height: 700,
                    }}
                />
                <h3>
                    <p> 
                        2D Histogram Contour Plot DEFAULT
                    </p>
                </h3>
            </>    
            )
        }
        

        //DEFAULT GRAPHS 

        else if (!xData && !yData && !zData && !plot){ //DEFAULT GRAPH
            return (
                    <>
                        
                        <Plot
                            data = {[
                                {
                                    x: [0], // x-axis values
                                    
                                    y: [0], // y-axis values
                                    
                                    z: [0],  // z-axis values
                                    
                                    mode: 'markers', //marker mode for a scatter plot
                                    
                                    marker: {
                                        size: 9,
                                        color: 'rgba(100, 100, 100, 1.0)', // Color
                                        line: {
                                            color: 'rgb(0,0,0),',
                                            width: 0.5
                                        }
                                    },
                                    
                                    type: 'scatter3d' // specify the 3D scatter plot type
                                
                                }
                            ]}

                            layout = {{
                                title: '3D Scatter Plot DEFAULT',
                                
                                scene: { //Define the 3D scene
                                    xaxis: { title: 'X Axis' },
                                    yaxis: { title: 'Y Axis'},
                                    zaxis: { title: 'Z Axis'}


                                },

                                margin: { l: 0, r: 0, b: 0, t: 0 },
                                
                                width: 1000, //Width of the Plot

                                height: 700, //Height of the Plot
                                
                            }}
                        />
                        <h3>
                            <p>Default 3D Scatter Plot: Load ".obj" or ".csv" File to Display Data.</p>
                        </h3>
                    </>
            )
        }
        else if (plot == "2D Scatter Plot") {//2D Scatter Plot DEFAULT
            return (
                <>
                    <Plot
                        data = {[
                            {
                            x: [0], // x=axis values
                            
                            y: [0], // y-axis values
                            
                            mode: 'markers', //marker mode for a scatter plot
                            
                            marker: {
                                size: 9,
                                color: 'rgba(100, 100, 100, 1.0)', // Color
                                line: {
                                    color: 'rgb(0,0,0),',
                                    width: 0.5
                                }
                            },
                            
                            type: 'scatter' // specify the 3D scatter plot type
                            
                            }
                        ]}
    
                        layout = {{
                            title: '2D Scatter Plot Title TEST',
                            
                            scene: { //Define the 3D scene
                                xaxis: { title: 'X Axis'},
                                yaxis: { title: 'Y Axis'}
                             
    
    
                            },
    
                            margin: { l: 0, r: 0, b: 0, t: 0 },
                            
                            width: 1000, //Width of the Plot
    
                            height: 700, //Height of the Plot
                            
                            
                        }}
                    />
                    <h3>
                        <p>2D Scatter Plot Default</p>
                    </h3>
                </>
            )
        } 
        else if (!xData && !yData && !zData && plot == "3D Scatter Plot") {//3D Scatter Plot Default
            return (
                <>
                    <Plot
                        data = {[
                            {
                            x: [0], // x=axis values
                            
                            y: [0], // y-axis values
                            
                            z: [0],  // z-axis values
                            
                            mode: 'markers', //marker mode for a scatter plot
                            
                            marker: {
                                size: 9,
                                color: 'rgba(100, 100, 100, 1.0)', // Color
                                line: {
                                    color: 'rgb(0,0,0),',
                                    width: 0.5
                                }
                            },
                            
                            type: 'scatter3d' // specify the 3D scatter plot type
                            
                            }
                        ]}
    
                        layout = {{
                            title: '3D Scatter Plot Title TEST',
                            
                            scene: { //Define the 3D scene
                                xaxis: { title: 'X Axis'},
                                yaxis: { title: 'Y Axis'},
                                zaxis: { title: 'Z Axis'}
    
    
                            },
    
                            margin: { l: 0, r: 0, b: 0, t: 0 },
                            
                            width: 1000, //Width of the Plot
    
                            height: 700, //Height of the Plot
                            
                          
    
                        }}
                    />
                    <h3>
                        <p>3D Scatter Plot Default</p>
                    </h3>
                </>
            )
        }   
        else if (!xData && !yData && !zData && !iData && !jData && !kData && plot == "Mesh3D") { //Mesh3D DEFAULT
            return (
                <>
                <Plot
                    data = {[
                        {
                            type: 'mesh3d', // specify the 3D scatter plot type    
                            
                            x: [0,1,2], // x=axis values
                            
                            y: [0,1,2], // y-axis values
                            
                            z: [0,1,2],  // z-axis values

                            //Triangle faces
                            i: [0, 0, 0], //i values

                            j: [1,1,1], //j values

                            k: [2,2,2], //k values
                            
                            color: 'red', //Color of Model
                            
                            opacity: 1.0, //Face Opacity

                            name: '3D Mesh Model',
                            hoverinfo: 'x+y+z',
                            lighting: {
                                ambient: 0.1,
                                diffuse: 0.7,
                                specular: 0.8,
                                roughness: 0.3
                            },
                            lightposition: {
                                x: 100, //x Light Source Position
                                y: 100, // y Light Source Position
                                z: 100, // z Light Source Position
                            }   
                           
                            }
                        
            
                    ]}
            
                    layout = {{
                        title: '3D MESH TEST',
                        
                        scene: { //Define the 3D scene
                            xaxis: { title: 'X Axis'},
                            yaxis: { title: 'Y Axis'},
                            zaxis: { title: 'Z Axis'}
            
            
                        },
            
                        margin: { l: 0, r: 0, b: 0, t: 0 },
                        
                        width: 1000, //Width of the Plot
            
                        height: 700, //Height of the Plot

            
                    }}
                />
                <h3>
                    <p>3D Mesh Plot Default</p>
                </h3>
                </>
            )
        }
        else if (!xData && !yData && plot == "2D Line Plot") { //2D Line Plot Default
            return (
                <>
                <Plot
                    data = {[
                        {
                            type: 'scatter', // specify the 3D scatter plot type    
                            
                            x: [0,1,2], // x=axis values
                            
                            y: [0,1,2], // y-axis values
                            

                            mode: 'lines'+'markers', //Draw Lines and Markers

                            marker: { //Data Points
                                size: 9,
                                color: 'rgba(100, 100, 100, 1.0)', 
                            
                            },
                            line: { //Line to Plot
                                color: 'red',
                                width: 0.5
                            },
                    
                            name: '2D Line Plot Default',
                            hoverinfo: 'x+y',
                            lighting: {
                                ambient: 0.1,
                                diffuse: 0.7,
                                specular: 0.8,
                                roughness: 0.3
                            }, 
                           
                            }
                        
            
                    ]}
            
                    layout = {{
                        title: '2D LINE PLOT TEST',
                        hoverinfo: 'x+y',
                        scene: { //Define the 3D scene
                            xaxis: { title: 'X Axis'},
                            yaxis: { title: 'Y Axis'},
                            zaxis: { title: 'Z Axis'}
            
            
                        },
            
                        margin: { l: 0, r: 0, b: 0, t: 0 },
                        
                        width: 1000, //Width of the Plot
            
                        height: 700, //Height of the Plot
                        
                       
            
                    }}
                />
                <h3>
                    <p>2D Line Plot Default</p>
                </h3>
                </>
            )
        }
        else if (!xData && !yData && !zData && plot == "3D Line Plot") { //3D Line Plot DEFAULT.
            return (
                <>
                    <Plot
                        data = {[
                            {
                            x: [1,2,3,4,5], // x=axis values
                            
                            y:[1,2,3,4,5], // y-axis values
                            
                            z: [1,2,3,4,5],  // z-axis values
                            
                            mode: 'lines'+'markers', //marker mode for a scatter plot
                            line: {
                                color: 'red',
                                width: 1.0, 
                            },
                            marker: {
                                size: 9,
                                color: 'rgba(100, 100, 100, 1.0)', // Color

                                
                            },
                            
                            type: 'scatter3d' // specify the 3D scatter plot type
                            
                            }
                        ]}
    
                        layout = {{
                            title: '3D Scatter Plot Title TEST',
                            
                            scene: { //Define the 3D scene
                                xaxis: { title: 'X Axis'},
                                yaxis: { title: 'Y Axis'},
                                zaxis: { title: 'Z Axis'}
    
    
                            },
    
                            margin: { l: 0, r: 0, b: 0, t: 0 },
                            
                            width: 1000, //Width of the Plot
    
                            height: 700, //Height of the Plot
                            
                      
                        }}
                    />
                    <h3>
                        <p>3D Line Plot Default</p>
                    </h3>
                </>
            )
        }
        else if (!xData && !yData && plot == "2D Bar Plot") { //2D Bar Plot Default
            return(
                <>
                    <Plot 
                        data = {[
                            {
                                x: [0], //x-axis values

                                y: [0], //y-axis values

                                type: 'bar', //Plot Type
                                
                                name: 'Default Data', //Name for Legend

                                marker: {
                                    size: 9,
                                    color: 'rgba(100, 100, 100, 1.0)', // Color
                                    
                                },
                                
                            }                               
                        ]} 
                        layout = {{
                            title: '2D Bar Plot',
                                    
                            
                            xaxis: { 
                                title: 'X Axis' 
                            
                            },
                            yaxis: { 
                                title: 'Y Axis'
                            
                            },
                    
                           

                            margin: { l: 0, r: 0, b: 0, t: 0 },
                            
                            width: 1000, //Width of the Plot

                            height: 700, //Height of the Plot

                            hoverinfo: 'x+y',

                            barmode: 'group', //Bar Display

                            //Legend
                            showlegend: true,
                            legend: {x: 0.1, y: 1.0}
                                    
                        }}
                    
                    />
                    <h3>
                        2D Bar Plot Default
                    </h3>
                </>
            )
        }
        else if (!xData && !yData && plot == "Heat Map") { //Heat Map.
            return (
                <>
                    <Plot
                        data = {[
                            {
                            z: [
                                [1, 20, 30],
                                [20, 1, 60],
                                [30, 60, 1],
                              ], //Heatmap Intensity Values
                            
                    
                            colorscale: "Viridis", //Customize colorscale
                            
                            type: 'heatmap' // Specify the 3D scatter plot type
                            
                            }
                        ]}
    
                        layout = {{
                            title: 'Heat Map TEST',
                            
                            scene: { //Define the 3D scene
                                xaxis: { title: 'X Axis'},
                                yaxis: { title: 'Y Axis'}
                             
    
    
                            },
    
                            margin: { l: 0, r: 0, b: 0, t: 0 },
                            
                            width: 1000, //Width of the Plot
    
                            height: 700, //Height of the Plot

                            

                            //Legend
                            showlegend: true,
                            legend: { x: 0.1, y: 1.0}
    
    
                        }}
                    />
                    <h3>
                        <p>Heat Map DEFAULT</p>
                    </h3>
                </>
            )
        }
        else if (!xData && !yData && plot == "Contour Plot") { //Contour Plot.
            return (
                <>
                    <Plot
                        data = {[
                            {
                            z: [[0,1,2],[1,2,3],[4,5,6]], //Heatmap Intensity Values
                            
                            x: "X-Axis", //x-axis labels
                            
                            y: "Y-Axis", //y-axis labels
                    
                            colorscale: "Jet", // Customize colorscale??
                            contours: {
                                coloring: "heatmap", //Fill color between lines
                                showlabels: true, //Show contour labels
                                labelfont: {
                                    size: 12, 
                                    color: "white"
                                }
                            },
                            line: {
                                smoothing: 0.85 //Smooth contour lines
                            },

                            type: 'contour', // Specify the Contour plot type
                           
                            }
                        ]}
    
                        layout = {{

                            

                            title: '',
                            
                            xaxis: { title: 'X Axis', automargin: true}, //X-axis title
                            yaxis: { title: 'Y Axis', automargin: true}, //Y-axis title
                            
                            margin: { l: 0, r: 0, b: 0, t: 0 },
                            
                            width: 1000, //Width of the Plot
    
                            height: 700, //Height of the Plot

                            

                            //Legend
                            showlegend: true,
                            legend: { x: 0.1, y: 1.0}
    
    
                        }}
                    />
                    <h3>
                        <p>Contour Plot DEFAULT</p>
                    </h3>
                </>
            )
        } else if (!xData && !yData && plot == '2D Histogram Heatmap') {
            return (
            <>
                <Plot
                    data = {[
                        {
                            x: [1,2,3,4], //X-axis data
                            y: [1,2,3,4], //Y-axis data
                            type: 'histogram2d', //Plot type
                            colorscale: 'Viridis', //Color Scheme
                        }
                    ]}
                    layout = {{
                        xaxis: { title: selectedColumnNameX },
                        yaxis: { title: selectedColumnNameY },
                        width: 1000, 
                        height: 700,
                    }}
                
            
                />
                <h3>
                    <p>
                        2D Histogram Heatmap DEFAULT
                    </p>
                </h3>
            </>
            )
        } else if (!xData && !yData && plot == '2D Histogram Contour'){
            return (
            <>
                <Plot
                    data = {[
                        {
                            x: [1,2,3,4], //X-axis data
                            y: [1,2,3,4], //Y-axis data
                            type: 'histogram2dcontour', //Plot type
                            colorscale: 'Jet', //Color Scheme
                            contours: {
                                coloring: 'heatmap', //Coloring type (can be 'heatmap', 'lines', or 'none')
                            }
                        }
                    ]}
                    layout = {{
                        xaxis: { title: selectedColumnNameX },
                        yaxis: { title: selectedColumnNameY },
                        width: 1000,
                        height: 700,
                    }}
                />
                <h3>
                    <p> 
                        2D Histogram Contour Plot DEFAULT
                    </p>
                </h3>
            </>    
            )
        }
            
    }
                            
     
return (
    <>
    <div className='mainplotcontainer'>
        <>
            <div className='plotoptions'>
                <h2>
                    Plot Options
                </h2>
                <br/>
                <label>Type: </label>
                <select className = "plotoptions" name = "plotoptions" onChange = {plotOptionsHandler} value = {selectedPlot}>
                {plotOptionsArray.map((option, index) => (
                        <option key = {index} value = {option}>
                            {option} 
                        </option>))}
                </select>
            </div>
            <br/>
            <br/>
        </>
        {plotHandler(xData, yData, zData, iData, kData, jData, selectedPlot)}
    </div>
    </>    
    )
    
};

export default ThreeDEnvironment;
