import pandas as pd
import flask
from flask import Flask, jsonify, request
import flask_cors
from flask_cors import CORS 
import tkinter as tk
from tkinter import *
from tkinter import ttk
from tkinter import filedialog, messagebox, simpledialog
import os
import json
import numpy as np
import scipy as sp
import scipy.stats as stats
from scipy.stats import ttest_ind, shapiro, f_oneway, chi2_contingency
import matplotlib as mp
import matplotlib.pyplot as plt
from matplotlib.backends.backend_tkagg import FigureCanvasTkAgg, NavigationToolbar2Tk
import seaborn as sns
import pandas as pd
import base64
import io
from io import BytesIO
import threading

#Initialize Flask Class and Allow Cross-Origin Requests
app = Flask(__name__)
CORS(app, resources = {r"/*": {"origins": "http://localhost:3000"}}) #Set Origin Request
#Max file size
app.config['MAX_CONTENT_LENGTH'] = 1000 * 1024 * 1024



#Frontend Upload File Function
def frontend_upload_file(file, file_type):
    global is_file_uploaded
    global data_columns
    global uploaded_data 
    try: 
        if file_type == ".csv":
            #Read CSV file using Pandas
            file_data = pd.read_csv(file.stream, encoding = 'ISO-8859-1')
            uploaded_data = file_data
            is_file_uploaded = True
            print("Uploaded Data")
            
            #CSV column selection
            data_columns = uploaded_data.columns.tolist()
            print("Column Names: ", data_columns)
            return uploaded_data
        elif file_type == ".obj":
            #Initialize Arrays for x, y, z Coordinates and Face Indices i, j , k
            x, y, z = [], [], []
            i, j, k = [], [], []

            try: 
                #Decode Binary Stream Into text Before Processing
                lines = file.stream.read().decode('utf-8').splitlines()
                #Loop to Read File
                for line in lines:
                    #Split the Line into Components
                    parts = line.split()
                    if not parts:
                        continue #Skip Empty Lines
                    #Process Vertex Lines (v)
                    elif parts[0] == 'v':
                        x.append(float(parts[1]))
                        y.append(float(parts[2]))
                        z.append(float(parts[3]))
                    #Process Face Lines
                    elif parts[0] == 'f':
                        #Extract vertex indices for each face
                        face_indices = [int(p.split('/')[0]) - 1 for p in parts[1:]] #Convert 1-Based to 0-Based
                        if len(face_indices) == 3: #Triangular Face
                            i.append(face_indices[0])
                            j.append(face_indices[1])
                            k.append(face_indices[2])
                        elif len(face_indices) > 3: #Polygon Case
                            #Split Polygons into 2 Triangles
                            i.extend([face_indices[0], face_indices[0]]) #First Vertex of Each Triangle
                            j.extend([face_indices[1], face_indices[2]]) #Second Vertex of Each Triangle
                            k.extend([face_indices[2], face_indices[3]]) #Third Vertex of Each Triangle


                
                #Assign uploaded_data to Ensure Update of Dictionary
                uploaded_data = {
                    "vertices": {
                        "x": x,
                        "y": y,
                        "z": z
                    },

                    "faces": {
                        "i": i,
                        "j": j,
                        "k": k
                    }

                }
                is_file_uploaded = True
                print("OBJ Data Upload Successful", uploaded_data)
                return uploaded_data
            except Exception as e: 
                jsonify({"Error": str(e)})
                print(f"Error reading file: {e}")
            except ValueError as ve:
                print(f"ValueError processing line: {line.strip()} - {ve}")
    except Exception as e:
        jsonify({"Error": str(e)})
        print(f"Error reading file: {e}")

#Frontend Filter Column Names
def frontend_filter_column_name_data(column1, column2, column3):
    global filtered_data1
    global filtered_data2
    global filtered_data3
    try:
        if column1 and column1 in uploaded_data.columns and column2 and column2 in uploaded_data.columns and column3 and column3 in uploaded_data.columns:
            filtered_data1 = uploaded_data[column1].dropna() #Filter Data 
            filtered_data2 = uploaded_data[column2].dropna() #Filter Data
            filtered_data3 = uploaded_data[column3].dropna() #Filter Data

            print("Column 1 Filtered Data Updated", filtered_data1)
            print("Column 2 Filtered Data Updated", filtered_data2)
            print("Column 3 Filtered Data Updated", filtered_data3)

            return filtered_data1, filtered_data2, filtered_data3
    except Exception as e: 
        print(f"Error: {e}")



#Frontend Data Analyzation 
def frontend_analyze_data(column1, column2, column3, test, mean):
    #Create Variables to Assign Results to
    global filtered_data1
    global filtered_data2
    global filtered_data3
    global test_statistic
    global p_value
    global degrees_of_freedom
    
    if column1 and column1 in uploaded_data.columns and test == "Mean": #Mean Calculation
        try:
            filtered_data1 = uploaded_data[column1].dropna() #Filter Data 
            print("Data Analyzed")
            print("The mean of the selected data is: ", np.mean(filtered_data1)) #Numpy Mean Function
        except Exception as e:
            print(f"Error analyzing data: {e}")
    elif column1 and column1 in uploaded_data.columns and test == "Shapiro-Wilk Test": #Shapiro-Wilk Test
            try:
                filtered_data1 = uploaded_data[column1].dropna() #Filter Uploaded Data
                test_statistic, p_value = shapiro(filtered_data1) #Run Shapiro Wilk Test and Store Data
                
                #Debug
                print("Data Analyzed")
                print("Data to Send to Frontend: ", test_statistic, p_value)
                print("Shapiro-Wilk data: ", shapiro(filtered_data1))
                return test_statistic, p_value
            except Exception as e:
                print(f"Error analyzing data: {e}")
                return None #Returns None in Case of Exception
    elif column1 and column1 in uploaded_data.columns and test == "One Sample T-Test": #One Sample T-Test
        try: 
            filtered_data1 = uploaded_data[column1].dropna() #Filter Uploaded Data
            test_statistic, p_value = stats.ttest_1samp(filtered_data1, mean) #Run One Sample-Test and Store Data

            #Debug
            print("Data Analyzed")
            print("One Sample T-Test data: ", stats.ttest_1samp(filtered_data1, mean))
            return test_statistic, p_value
        except Exception as e: 
            print(f"Error analyzing data: {e}")
    elif column1 and column1 in uploaded_data.columns and column2 and column2 in uploaded_data.columns and test == "Independent T-Test": #T-Test
        try:
            filtered_data1 = uploaded_data[column1].dropna() #Filter Uploaded Data
            global filtered_data2
            filtered_data2 = uploaded_data[column2].dropna() #Filter Uploaded Data
            test_statistic, p_value = ttest_ind(filtered_data1, filtered_data2) # Run Inpendent T-Test and Store Data

            #Debug
            print("Data Analayzed")
            print("T-Test Data: ", ttest_ind(filtered_data1, filtered_data2))
            return test_statistic, p_value
        except Exception as e:
            print(f"Error analyzing data: {e}")
    elif column1 and column1 in uploaded_data.columns and column2 and column2 in uploaded_data.columns and test == "Chi-Squared Test of Independence": #Chi-Squared Test of Independence
        try: 
            df = pd.DataFrame(uploaded_data) #Dataframe
            contingency_table = pd.crosstab(df[column1], df[column2]) #Create Contingency Tables for Categorical Variables
            chi2, p, dof, expected = stats.chi2_contingency(contingency_table) #Test Data
            print(f"Test Statistic:  {chi2}, P-Value:  {p}, Degrees of Freedom:  {dof}, Expected:  {expected}") #Results
        except Exception as e:
            print(f"Error analyzing data: {e}")
            messagebox.showerror("Error", "An error occurred while analyzing the data: Chi-Squared Test of Independence. Please select the appropriate data types.")
    elif column1 and column1 in uploaded_data.columns and column2 and column2 in uploaded_data.columns and column3 in uploaded_data.columns and test == "One-Way ANOVA Test": #One-Way ANOVA
        try: 
            filtered_data1 = uploaded_data[column1].dropna() #Filter
            filtered_data2 = uploaded_data[column2].dropna() #Filter
            global filtered_data3
            filtered_data3 = uploaded_data[column3].dropna() #Filter
            print("Data Analyzed")
            print("One-Way ANOVA Data: ", f_oneway(filtered_data1, filtered_data2, filtered_data3))
        except Exception as e: 
            print(f"Error analyzing data: {e}")
    return None #Send to Frontend?

#Display Data Function?????
def frontend_display_data(column1, column2, display):
    global display_figure
    global display_choice
    global toolbar
    filtered_data1 = uploaded_data[column1].dropna() #Filter Uploaded Data for Column 1
    filtered_data2 = uploaded_data[column2].dropna() #Filter Uploaded Data for Column 2
    print("Display Data Test")
    
    #Clear the previous figure if it exists
    if 'display_figure' in globals():
        plt.clf() #Clear the current figure to prevent overlap
        plt.close(display_figure) #Close figure (Ensures Blank Canvas)
    if column1 and column1 in uploaded_data.columns and display == "Q-Q Plot": #Q-Q Plot
        try: 
            plt.figure(figsize = (12, 6))
            display_figure = stats.probplot(filtered_data1, dist = "norm", plot = plt) #Update Widget Storage Variable
            plt.title("Q-Q Plot for " + column1)
            
            #Save plot to a BytesIO object
            buf = BytesIO()
            plt.savefig(buf, format='png')
            buf.seek(0)

            print("Q-Q Plot Rendered")
            return display_figure
        except Exception as e:  

            print(f"Error displaying data: {e}")
            messagebox.showerror("Error", "An error occurred while trying to display data: Q-Q Plot. Please select the apporpriate data type.")
    elif column_name1 and column_name1 in uploaded_data.columns and display_choice == "Histogram": #Histogram
        try:
            df = pd.DataFrame(uploaded_data) #Dataframe
            print("Histogram Rendered")
            plt.figure(figsize = (12, 6))
            display_figure = sns.histplot(data = df, x = filtered_data1, y = filtered_data2, stat = 'count', element = 'bars', linewidth = 1) #Update Widget Storage Variable
            plt.title("Histogram for " + column_name1)
            plt.xlabel(column_name1)
            plt.ylabel(column_name2)
            updated_canvas = FigureCanvasTkAgg(plt.gcf(), master = frm) #Get Current Figure and Render to Canvas
            updated_canvas.draw() #Draw Canvas
            updated_canvas.get_tk_widget().grid(column = 40, row = 50)
        except Exception as e: 
            print(f"Error displaying data: {e}")
            messagebox.showerror("Error", "An error occurred while trying to display data: Histogram. Please select the appropriate data type.")
    elif column_name1 and column_name1 in uploaded_data.columns and column_name2 and column_name2 in uploaded_data.columns and  display_choice == "Box Plot": #Box Plot
        df = pd.DataFrame(uploaded_data) #Dataframe
        try:  
            print("Box Plot Rendered")
            plt.figure(figsize = (12, 6))
            display_figure = sns.boxplot(data = df, x = filtered_data1, y = filtered_data2) #Update Widget Storage Variable
            plt.title("Box Plot for " + column_name1)
            plt.xlabel(f"{column_name1}")
            plt.ylabel(f"{column_name2}")
            updated_canvas = FigureCanvasTkAgg(plt.gcf(), master = frm) #Get Current Figure and Render to Canvas
            updated_canvas.draw() #Draw Canvas
            updated_canvas.get_tk_widget().grid(column = 40, row = 50)
        except Exception as e: 
            print(f"Error displaying data: {e}")
            messagebox.showerror("Error", "An error occurred while trying to display data: Box Plot. Please select the appropriate data type.")
    elif column_name1 and column_name1 in uploaded_data.columns and column_name2 and column_name2 in uploaded_data.columns and display_choice == "Scatter Plot (With Regression)": #Scatter Plot with Regression 
        df = pd.DataFrame(uploaded_data) #Dataframe
        try: 
            print("Scatter Plot (With Regression) Rendered")
            display_figure = sns.lmplot(data = df, x = column_name1, y = column_name2, aspect = 2, height = 6) #Update Widget Storage Variable
            plt.ylabel(f"{column_name1}")
            plt.ylabel(f"{column_name2}")
            updated_canvas = FigureCanvasTkAgg(plt.gcf(), master = frm) #Get Current Figure and Render to Canvas
            updated_canvas.draw() #Draw Canvas
            updated_canvas.get_tk_widget().grid(column = 40, row = 50)
        except Exception as e: 
            print(f"Error displaying data: {e}")
            messagebox.showerror("Error", "An error occurred while trying to display data: Scatter Plot (With Regression). Please select the appropriate data type.")
    else:
        messagebox.showwarning("Warning", "Please select a valid column with the appropriate data type.")
    

#Post Requests
@app.route('/api/data', methods = ['POST'])
def csv_listener_Post():
    #Uploaded File Toggle Variable (Boolean)
    request_type = request.headers.get('X-Request-Type')
    
    if request_type == 'upload-data': #Upload Data
        #Check if a file was provided in the request
        if 'file' not in request.files:
            return jsonify({"Error": "No file provided"}), 400
        
        #Store File in Variable
        frontend_file = request.files['file']

        #Read the File Type and Store File Type in a Variable
        frontend_file_type = os.path.splitext(frontend_file.filename)[1]
        print("Uploaded File Type: ", frontend_file_type)

        try:
            #Pass Frontend File Data and File Type to frontend_upload_file Function
            result = frontend_upload_file(frontend_file, frontend_file_type)
            is_file_uploaded = True

            #Unpack Result of frontend_upload_file() 
            uploaded_data = result 

            #Debug
            print("File Uploaded Successfully")
            print(frontend_file.filename)
            return jsonify({"Message": "File Data Received Successfully", "File Name": frontend_file.filename, "Uploaded Data": result}), 200 #DEBUG FOR .csv FILES!!!!!
        except Exception as e:
            print(f"Error: {str(e)}")
            return jsonify({"Error": str(e)}), 500
    elif request_type == 'display-data': #Column Data Selection Update 
    
        #Parse JSON data from the request body
        data = request.get_json()
        #Declare Variable to Store Column Name
        column_name1 = data.get('column1')
        column_name2 = data.get('column2')
        column_name3 = data.get('column3')
        #Pass Column Variable Into Filter Function
        result = frontend_filter_column_name_data(column_name1, column_name2, column_name3)
        
        filtered_data1, filtered_data2, filtered_data3 = result #Unpack Result
        

        if result is None: 
            return jsonify({"Error": "Could not filter data for column name(s)"})
        
        #Declare and Assign JSON Converted Data Values
        json_filtered_data1 = filtered_data1.to_list()
        json_filtered_data2 = filtered_data2.to_list()
        json_filtered_data3 = filtered_data3.to_list()

        #Debug
        print("Column 1 Data to Be Sent: ", json_filtered_data1)
        print(type(json_filtered_data1))
        print("Column 2 Data to Be Sent: ", json_filtered_data2)
        print(type(json_filtered_data2))
        print("Column 3 Data to Be Sent: ", json_filtered_data3)
        print(type(json_filtered_data3))
    
        return jsonify({ #Send Column Data for .csv Files to Frontend
                "Message": "Column Data Selected",
                "Filtered Data for Column 1": json_filtered_data1,
                "Filtered Data for Column 2": json_filtered_data2,
                "Filtered Data for Column 3": json_filtered_data3
        }), 200
    elif request_type == 'analyze-data-post': #Analyze Data
        #Parse JSON data from the request body
        data = request.get_json()
        #Declare Varibales to Store JSON data
        column_name1 = data.get('column1')
        column_name2 = data.get('column2')
        column_name3 = data.get('column3')
        mean = data.get('mean')
        test_name = data.get('test')
    
        #Debug
        print("Column Name 1: ", column_name1)
        print("Column Name 2: ", column_name2)
        print("Column Name 3: ", column_name3)
        print("Test: ", test_name)
        print("Mean to Test Against: ", mean)
        
        result = frontend_analyze_data(column_name1, column_name2, column_name3, test_name, mean) #Call analyze_data Function with Frontend Arguments
        
        if result is None:
            return jsonify({"Error": "Data Analysis Yielded no Results."})
        
        test_statistic, p_value = result #Unpack Result Values
        print("Data Analyzed.")


        return jsonify({
            "Message": "Data Analyzed Successfully",
            "Test Statistic" : test_statistic,
            "P-Value": p_value
        }), 200
    return jsonify({"Error": "Invalid Request Type"}), 400


#Get Requests
@app.route('/api/data', methods = ['GET'])
def csv_listener_Get():
    request_type = request.headers.get('X-Request-Type')
    if request_type == 'get-column-headers': #Column Selection 
        try:
            print("Column Headers Sent.")
        except Exception as e: 
            print(f"Error: {str(e)}")
        return jsonify(data_columns = list(data_columns)) #Send Column Names to Local Server in JSON format  
    #Display Data
    return jsonify({"Error: " "Invalid Request Type"}), 600



#Launch Backend UI Function
def launch_backend_ui():
    launch.destroy() #Close Launch Window

    #SERVER
    def run_flask_server():
        #App Port Number (Also prevent duplicate servers)
        app.run(port = 5000, debug = True, use_reloader = False) 
        print("Flask Server Running...")

    #Start Flask in a Different Thread
    if __name__ == '__main__':
        threading.Thread(target = run_flask_server, daemon =True).start()


    #Backend UI Creation variables
    root = Tk() #Create main window
    root.title("Backend Server UI")
    frm = tk.Frame(root) #Create a container widget
    frm.grid()
    #Configure 'root' to Allow Additional Space
    root.grid_columnconfigure(0, weight = 1)
    root.grid_rowconfigure(0, weight = 1)
    
    #Set Application to fullscreen 
    root.state('zoomed')
    #UI
    
    #Add Frame Elements Using a Grid
    frm.grid(row = 0, column = 0, stick = "nsew") #Allow Grid to Expand to Whole Window
    ttk.Label(frm, text = "Upload CSV").grid(column = 0, row = 0)
    
    #Variables to Store Column Names 
    column_name1 = ""
    column_name2 = ""
    column_name3 = ""


    #Column Selection Variables
    selected_column1 = tk.StringVar(root)
    selected_column1.set("Select a Column 1")
    selected_column2 = tk.StringVar(root)
    selected_column2.set("Select a Column 2")
    selected_column3 = tk.StringVar(root)
    selected_column3.set("Select a Column 3")

    #Dropdown Menu for Data Columns 1 Declaration
    dropdown_data_column1_menu = tk.OptionMenu(frm, selected_column1, "Select a Column 1")
    dropdown_data_column1_menu.grid(column = 4, row = 6) #Dropdown Menu for Data Columns
    dropdown_data_column1_menu_label = ttk.Label(frm, text = "Data Column 1") #Label for Data Columns Menu 1
    dropdown_data_column1_menu_label.grid(column = 4, row = 5)


    #Dropdown Menu for Data Columns 2 Declaration
    dropdown_data_column2_menu = tk.OptionMenu(frm, selected_column2, "Select a Column 2")
    dropdown_data_column2_menu.grid(column = 5, row = 6) #Dropdown Menu for Data Columns
    dropdown_data_column2_menu_label = ttk.Label(frm, text = "Data Column 2") #Label for Data Columns Menu 2
    dropdown_data_column2_menu_label.grid(column = 5, row = 5)

    #Dropdown Menu for Data Columns 3 Declaration
    dropdown_data_column3_menu = tk.OptionMenu(frm, selected_column3, "Select a Column 3")
    dropdown_data_column3_menu.grid(column = 6, row = 6) #Dropdown Menu for Data Columns
    dropdown_data_column3_menu_label = ttk.Label(frm, text = "Data Column 3") #Label for Data Columns Menu 3
    dropdown_data_column3_menu_label.grid(column = 6, row = 5)

    #Dropdown Menu Update Functions
    def update_dropdown1(options):
        #Option Menu for column selection
        menu1 = dropdown_data_column1_menu["menu"]
        menu1.delete(0,"end")

        #Add Options to the Dropdown Menu
        for option in options:
            menu1.add_command(label = option, command = lambda value = option: selected_column1.set(value))
        
    def update_dropdown2(options):
        #Option Menu for Column Selection
        menu2 = dropdown_data_column2_menu["menu"]
        menu2.delete(0,"end")

        #Add Options to the Dropdown Menu
        for option in options:
            menu2.add_command(label = option, command = lambda value = option: selected_column2.set(value))

    def update_dropdown3(options):
        #Option Menu for Column Selection
        menu3 = dropdown_data_column3_menu["menu"]
        menu3.delete(0,"end")

        #Add Options to the Dropdown Menu
        for option in options:
            menu3.add_command(label = option, command = lambda value = option: selected_column3.set(value))




    #File storage
    file_name_var = tk.StringVar()
    #Nested File Selection Function
    def select_file(): 
        global file_path
        #Open file dialog box
        file_path = filedialog.askopenfilename(
            filetypes = [("CSV files", "*.csv")],
            title = "Choose a CSV file"
        )
        if file_path: 
            file_name_var.set(file_path)

    #File Upload Function
    def upload_file(): 
        global file_path
        file_path = file_name_var.get()
        if os.path.isfile(file_path): #Check to see if file is valid
            try: 
                #Read CSV file using Pandas
                file_data = pd.read_csv(file_path, encoding = 'ISO-8859-1')
                global uploaded_data 
                uploaded_data = file_data
                
                #Display Success Message
                messagebox.showinfo("File Upload:", "File uploaded successfully!")
                print("Uploaded Data")
                
                #CSV column selection
                global data_columns
                data_columns = uploaded_data.columns.tolist()
                update_dropdown1(data_columns)
                update_dropdown2(data_columns)
                update_dropdown3(data_columns)
                print("Column Names: ", data_columns)
            
            except Exception as e:
                print(f"Error reading file: {e}")
                messagebox.showerror("Error", "An error occurred while reading the file.")        
        else:
                messagebox.showwarning("Warning:", "The selected file is not valid.")
            

    #Data Analyzation 
    def analyze_data():
        global filtered_data1
        global filtered_data2
        global filtered_data3
        global popmean
        #Column Name Declaration
        column_name1 = selected_column1.get() 
        column_name2 = selected_column2.get()
        column_name3 = selected_column3.get()
        #Filtered Data Declaration
        test_name = selected_test.get()
        if column_name1 and column_name1 in uploaded_data.columns and test_name == "Mean": #Mean Calculation
            try:
                filtered_data1 = uploaded_data[column_name1].dropna() #Filter
                print("Data Analyzed")
                print("The mean of the selected data is: ", np.mean(filtered_data1)) #Numpy Mean Function
                messagebox.showinfo("Mean: ", np.mean(filtered_data1))
            except Exception as e:
                print(f"Error analyzing data: {e}")
                messagebox.showerror("Error", "An error occurred while analyzing the data: Mean calculation. Please select the appropriate data type.")
        elif column_name1 and column_name1 in uploaded_data.columns and test_name == "Shapiro-Wilk Test": #Shapiro-Wilk Test
                try:
                    filtered_data1 = uploaded_data[column_name1].dropna() #Filter
                    print("Data Analyzed")
                    print("Shapiro-Wilk data: ", shapiro(filtered_data1))
                    messagebox.showinfo("Shapiro-Wilk data: ", shapiro(filtered_data1))
                except Exception as e:
                    print(f"Error analyzing data: {e}")
                    messagebox.showerror("Error", "An error occurred while analyzing the data: Shapiro-Wilk Test. Please select the appropriate data type.")
        elif column_name1 and column_name1 in uploaded_data.columns and test_name == "One Sample T-Test": #One Sample T-Test
            try: 
                global popmean
                popmean = simpledialog.askfloat("Input Required", "Please enter a population mean to test against: ")
                filtered_data1 = uploaded_data[column_name1].dropna() #Filter
                print("Data Analyzed")
                print("One Sample T-Test data: ", stats.ttest_1samp(filtered_data1, popmean))
                messagebox.showinfo("One Sample T-Test data: ", stats.ttest_1samp(filtered_data1, popmean))
            except Exception as e: 
                print(f"Error analyzing data: {e}")
                messagebox.showerror("Error", "An error occurred while analyzing the data: One Sample T-Test. Please select the appropriate data type.")
        elif column_name1 and column_name1 in uploaded_data.columns and column_name2 and column_name2 in uploaded_data.columns and test_name == "Independent T-Test": #T-Test
            try:
                filtered_data1 = uploaded_data[column_name1].dropna() #Filter
                global filtered_data2
                filtered_data2 = uploaded_data[column_name2].dropna() #Filter
                print("Data Analayzed")
                print("T-Test Data: ", ttest_ind(filtered_data1, filtered_data2))
                messagebox.showinfo("Independent T-Test Data: ", ttest_ind(filtered_data1, filtered_data2))
            except Exception as e:
                print(f"Error analyzing data: {e}")
                messagebox.showerror("Error", "An error occurred while analyzing the data: Independent T-Test. Please select the appropriate data types.")
        elif column_name1 and column_name1 in uploaded_data.columns and column_name2 and column_name2 in uploaded_data.columns and test_name == "Chi-Squared Test of Independence": #Chi-Squared Test of Independence
            try: 
                df = pd.DataFrame(uploaded_data) #Dataframe
                column_name1 = selected_column1.get()
                column_name2 = selected_column2.get()
                contingency_table = pd.crosstab(df[column_name1], df[column_name2]) #Create contingency table
                chi2, p, dof, expected = stats.chi2_contingency(contingency_table) #Test Data
                print(f"Test Statistic:  {chi2}, P-Value:  {p}, Degrees of Freedom:  {dof}, Expected:  {expected}") #Results
                messagebox.showinfo("Chi-Squared Test of Independence Data: ", f"Test Statistic: {chi2}, P-Value: {p}, Degrees of Freedom: {dof}, Expected: {expected}") #Results
            except Exception as e:
                print(f"Error analyzing data: {e}")
                messagebox.showerror("Error", "An error occurred while analyzing the data: Chi-Squared Test of Independence. Please select the appropriate data types.")
        elif column_name1 and column_name1 in uploaded_data.columns and column_name2 and column_name2 in uploaded_data.columns and column_name3 in uploaded_data.columns and test_name == "One-Way ANOVA Test": #One-Way ANOVA
            try: 
                filtered_data1 = uploaded_data[column_name1].dropna() #Filter
                filtered_data2 = uploaded_data[column_name2].dropna() #Filter
                global filtered_data3
                filtered_data3 = uploaded_data[column_name3].dropna() #Filter
                print("Data Analyzed")
                print("One-Way ANOVA Data: ", f_oneway(filtered_data1, filtered_data2, filtered_data3))
                messagebox.showinfo("One-Way ANOVA Data: ", f_oneway(filtered_data1, filtered_data2, filtered_data3))
            except Exception as e: 
                print(f"Error analyzing data: {e}")
                messagebox.showerror("Error", "An error occurred while analyzing the data: One-Way ANOVA. Please select the appropriate data types.")
        return () #Send to Frontend?
    
    #Display Data Function
    def display_data():
        global display_figure
        global display_choice
        global updated_canvas
        global toolbar
        display_figure = plt.figure(figsize = (12,6)) #Default Figure/Storage of New Figures
        display_choice = selected_display.get()
        column_name1 = selected_column1.get() #Store column data 
        column_name2 = selected_column2.get() #Store column data
        filtered_data1 = uploaded_data[column_name1].dropna() #Filter
        filtered_data2 = uploaded_data[column_name2].dropna() #Filter
        print("Display Data Test")
        
        #Clear the previous figure if it exists
        if 'display_figure' in globals():
            plt.clf() #Clear the current figure to prevent overlap
            plt.close(display_figure) #Close figure (Ensures Blank Canvas)
        if column_name1 and column_name1 in uploaded_data.columns and display_choice == "Q-Q Plot": #Q-Q Plot
            try: 
                plt.figure(figsize = (12, 6))
                display_figure = stats.probplot(filtered_data1, dist = "norm", plot = plt) #Update Widget Storage Variable
                plt.title("Q-Q Plot for " + column_name1)
                updated_canvas = FigureCanvasTkAgg(plt.gcf(), master = frm) #Get Current Figure and Render to Canvas
                updated_canvas.draw() #Draw Canvas
                updated_canvas.get_tk_widget().grid(column = 40, row = 50)
                print("Q-Q Plot Rendered")
            except Exception as e:  

                print(f"Error displaying data: {e}")
                messagebox.showerror("Error", "An error occurred while trying to display data: Q-Q Plot. Please select the apporpriate data type.")
        elif column_name1 and column_name1 in uploaded_data.columns and display_choice == "Histogram": #Histogram
            try:
                df = pd.DataFrame(uploaded_data) #Dataframe
                print("Histogram Rendered")
                plt.figure(figsize = (12, 6))
                display_figure = sns.histplot(data = df, x = filtered_data1, y = filtered_data2, stat = 'count', element = 'bars', linewidth = 1) #Update Widget Storage Variable
                plt.title("Histogram for " + column_name1)
                plt.xlabel(column_name1)
                plt.ylabel(column_name2)
                updated_canvas = FigureCanvasTkAgg(plt.gcf(), master = frm) #Get Current Figure and Render to Canvas
                updated_canvas.draw() #Draw Canvas
                updated_canvas.get_tk_widget().grid(column = 40, row = 50)
            except Exception as e: 
                print(f"Error displaying data: {e}")
                messagebox.showerror("Error", "An error occurred while trying to display data: Histogram. Please select the appropriate data type.")
        elif column_name1 and column_name1 in uploaded_data.columns and column_name2 and column_name2 in uploaded_data.columns and  display_choice == "Box Plot": #Box Plot
            df = pd.DataFrame(uploaded_data) #Dataframe
            try:  
                print("Box Plot Rendered")
                plt.figure(figsize = (12, 6))
                display_figure = sns.boxplot(data = df, x = filtered_data1, y = filtered_data2) #Update Widget Storage Variable
                plt.title("Box Plot for " + column_name1)
                plt.xlabel(f"{column_name1}")
                plt.ylabel(f"{column_name2}")
                updated_canvas = FigureCanvasTkAgg(plt.gcf(), master = frm) #Get Current Figure and Render to Canvas
                updated_canvas.draw() #Draw Canvas
                updated_canvas.get_tk_widget().grid(column = 40, row = 50)
            except Exception as e: 
                print(f"Error displaying data: {e}")
                messagebox.showerror("Error", "An error occurred while trying to display data: Box Plot. Please select the appropriate data type.")
        elif column_name1 and column_name1 in uploaded_data.columns and column_name2 and column_name2 in uploaded_data.columns and display_choice == "Scatter Plot (With Regression)": #Scatter Plot with Regression 
            df = pd.DataFrame(uploaded_data) #Dataframe
            try: 
                print("Scatter Plot (With Regression) Rendered")
                display_figure = sns.lmplot(data = df, x = column_name1, y = column_name2, aspect = 2, height = 6) #Update Widget Storage Variable
                plt.ylabel(f"{column_name1}")
                plt.ylabel(f"{column_name2}")
                updated_canvas = FigureCanvasTkAgg(plt.gcf(), master = frm) #Get Current Figure and Render to Canvas
                updated_canvas.draw() #Draw Canvas
                updated_canvas.get_tk_widget().grid(column = 40, row = 50)
            except Exception as e: 
                print(f"Error displaying data: {e}")
                messagebox.showerror("Error", "An error occurred while trying to display data: Scatter Plot (With Regression). Please select the appropriate data type.")
        else:
            messagebox.showwarning("Warning", "Please select a valid column with the appropriate data type.")
        

        #Remove Old Toolbar if it exists
        for widget in toolbar_frm.winfo_children():
            widget.destroy()
        
        #Create a New Toolbar for 'updated_canvas'
        toolbar = NavigationToolbar2Tk(updated_canvas, toolbar_frm)
        toolbar.update()
        toolbar.pack(side = tk.BOTTOM, fill = tk.X)





    #File Path Holder
    ttk.Entry(frm, textvariable = file_name_var, width = 50, state = "readonly").grid(column = 0, row = 1) #File path displayed after upload

    #Default Figure and Canvas Placement
    display_figure = plt.figure(figsize = (12,6)) #Default Figure/Storage of New Figures
    canvas = FigureCanvasTkAgg(display_figure, master = frm)
    canvas_widget = canvas.get_tk_widget()
    canvas_widget.grid(column = 40, row = 50)

    #Buttons
    ttk.Button(frm, text = "Upload", command = select_file).grid(column = 1, row = 1) #Upload Button
    ttk.Button(frm, text = "Submit", command = upload_file ).grid(column = 1, row = 2) #Submit Button
    ttk.Button(frm, text = "Analyze", command = analyze_data).grid(column = 2, row = 10) #Analyze button
    ttk.Button(frm, text = "Display Data", command = display_data, ).grid(column = 2, row = 13) #Button for Displaying Data
    

    #Statistical Test Selection Variables
    statistical_tests = ["Mean","Shapiro-Wilk Test", "One Sample T-Test", "Independent T-Test", "Chi-Squared Test of Independence", "One-Way ANOVA Test", "Two-Way ANOVA Test"]
    selected_test = tk.StringVar(root)
    if selected_test:
        selected_test.set(statistical_tests[0]) #Set default to the first index

    #Dropdown for Statistical Tests
    dropdown_test_menu = tk.OptionMenu(frm, selected_test, *statistical_tests)#Dropdown Menu for Statistical Tests
    dropdown_test_menu.grid(column = 1, row = 10) 
    dropdown_test_menu_label = ttk.Label(frm, text = "Statistical Test") #Label for Statistical Tests Menu
    dropdown_test_menu_label.grid(column = 1, row = 9)

    #Display Variables
    displays = ["Q-Q Plot", "Histogram", "Box Plot", "Scatter Plot (With Regression)"]
    selected_display = tk.StringVar(root)
    if selected_display:
        selected_display.set(displays[0]) #Set the default display selection

    #Display Dropdown 
    dropdown_displays = tk.OptionMenu(frm, selected_display, *displays) #Dropdown Menu for Displays
    dropdown_displays.grid(column = 1, row = 13) 
    dropdown_display_label = ttk.Label(frm, text = "Display Type") #Label for Display Dropdown
    dropdown_display_label.grid(column = 1, row = 12)

    #Matplotlib Toolbar
    toolbar_frm = tk.Frame(root) #Container widget for toolbar
    toolbar_frm.grid(row = 0, column = 0, sticky = 'ew')

    root.mainloop()#Starts application event loop: keeping the window open and interactive until user closes
    print("Backend Launched")


        


#Launch Window
launch = Tk() #Create Launch Window
launch.state('zoomed') #Full Screen
launch.title("Launch Backend UI")
launch_frm = tk.Frame(launch) #Create a container widget
launch_frm.grid()
#Button to Launch Backend UI
tk.Button(launch_frm, text = "Launch Backend UI", command = launch_backend_ui).grid(column = 0, row = 0) #Starts application event loop: keeping the window open and interactive until user closes)

launch.mainloop()#Starts application event loop: keeping the window open and interactive until user closes



