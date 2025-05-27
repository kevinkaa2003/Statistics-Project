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
import numpy as np
import scipy as sp
import scipy.stats as stats
from scipy.stats import ttest_ind, shapiro, f_oneway, chi2_contingency
import matplotlib as mp
import matplotlib.pyplot as plt
from matplotlib.backends.backend_tkagg import FigureCanvasTkAgg, NavigationToolbar2Tk
import seaborn as sns
import pandas as pd


#Application Creation variables
root = Tk() #Create main window
frm = tk.Frame(root) #Create a container widget


#Configure 'root' to Allow Additional Space
root.grid_columnconfigure(0, weight = 1)
root.grid_rowconfigure(0, weight = 1)

#Set Application to fullscreen 
root.state('zoomed')

#File Name Variable
file_name_var = tk.StringVar()

#Column Selection Variables
selected_column1 = tk.StringVar(root)
selected_column1.set("Select a Column 1")
selected_column2 = tk.StringVar(root)
selected_column2.set("Select a Column 2")
selected_column3 = tk.StringVar(root)
selected_column3.set("Select a Column 3")

#Statistical Test Selection Variables
statistical_tests = ["Mean","Shapiro-Wilk Test", "One Sample T-Test", "Independent T-Test", "Chi-Squared Test of Independence", "One-Way ANOVA Test", "Two-way ANOVA Test"]
selected_test = tk.StringVar(root)
if selected_test:
    selected_test.set(statistical_tests[0]) #Set default to the first index

#Display Variables
displays = ["Q-Q Plot", "Histogram", "Box Plot", "Scatter Plot (With Regression)"]
selected_display = tk.StringVar(root)
if selected_display:
    selected_display.set(displays[0]) #Set the default display selection



#UI


#Add Frame Elements Using a Grid
frm.grid(row = 0, column = 0, stick = "nsew") #Allow Grid to Expand to Whole Window
ttk.Label(frm, text = "Upload CSV").grid(column = 0, row = 0)
ttk.Entry(frm, textvariable = file_name_var, width = 50, state = "readonly").grid(column = 0, row = 1) #File path displayed after upload



#Default Figure and Canvas Placement
display_figure = plt.figure(figsize = (12,6)) #Default Figure/Storage of New Figures
canvas = FigureCanvasTkAgg(display_figure, master = frm)
canvas_widget = canvas.get_tk_widget()
canvas_widget.grid(column = 40, row = 50)


#Matplotlib Toolbar
toolbar_frm = tk.Frame(root) #Container widget for toolbar
toolbar_frm.grid(row = 0, column = 0, sticky = 'ew')


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


#Dropdown for Statistical Tests
dropdown_test_menu = tk.OptionMenu(frm, selected_test, *statistical_tests)#Dropdown Menu for Statistical Tests
dropdown_test_menu.grid(column = 1, row = 10) 
dropdown_test_menu_label = ttk.Label(frm, text = "Statistical Test") #Label for Statistical Tests Menu
dropdown_test_menu_label.grid(column = 1, row = 9)

#Display Dropdown 
dropdown_displays = tk.OptionMenu(frm, selected_display, *displays) #Dropdown Menu for Displays
dropdown_displays.grid(column = 1, row = 13) 
dropdown_display_label = ttk.Label(frm, text = "Display Type") #Label for Display Dropdown
dropdown_display_label.grid(column = 1, row = 12)






#File Selection Function
def selectfile(): 
    #Open file dialog box
    file_path = filedialog.askopenfilename(
        filetypes = [("CSV files", "*.csv")],
        title = "Choose a CSV file"
    )
    if file_path: 
        file_name_var.set(file_path)

#File Upload Function
def uploadfile(): 
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
            updatedropdown1(data_columns)
            updatedropdown2(data_columns)
            updatedropdown3(data_columns)
            print("Column Names: ", data_columns)
        
        except Exception as e:
            print(f"Error reading file: {e}")
            messagebox.showerror("Error", "An error occurred while reading the file.")        

    else:
            messagebox.showwarning("Warning:", "The selected file is not valid.")


#Dropdown Menu Update Functions
def updatedropdown1(options):
    #Option Menu for column selection
    menu1 = dropdown_data_column1_menu["menu"]
    menu1.delete(0,"end")

    #Add Options to the Dropdown Menu
    for option in options:
        menu1.add_command(label = option, command = lambda value = option: selected_column1.set(value))
    
def updatedropdown2(options):
    #Option Menu for Column Selection
    menu2 = dropdown_data_column2_menu["menu"]
    menu2.delete(0,"end")

    #Add Options to the Dropdown Menu
    for option in options:
        menu2.add_command(label = option, command = lambda value = option: selected_column2.set(value))

def updatedropdown3(options):
    #Option Menu for Column Selection
    menu3 = dropdown_data_column3_menu["menu"]
    menu3.delete(0,"end")

    #Add Options to the Dropdown Menu
    for option in options:
        menu3.add_command(label = option, command = lambda value = option: selected_column3.set(value))



#Data Analyzation 
def analyzedata():
    #Column Name Declaration
    global column_name1
    global column_name2
    global column_name3
    column_name1 = selected_column1.get()
    column_name2 = selected_column2.get()
    column_name3 = selected_column3.get()
    #Filtered Data Declaration
    test_name = selected_test.get()
    if column_name1 and column_name1 in uploaded_data.columns and test_name == "Mean": #Mean Calculation
        try:
            global filtered_data1
            filtered_data1 = uploaded_data[column_name1].dropna() #Filter
            print("Data Analyzed")
            print("The mean of the selected data is: ", np.mean(filtered_data1)) #Numpy Mean Function
            messagebox.showinfo("Mean: ", np.mean(filtered_data1))
        except Exception as e:
            print(f"Error analyzing data: {e}")
            messagebox.showerror("Error", "An error occurred while analyzing the data: Mean calculation. Please select the appropriate data type.")
    elif column_name1 and column_name1 in uploaded_data.columns and test_name == "Shapiro-Wilk Test": #Shapiro-Wilk Test
            try:
                print("Data Analyzed")
                print("Shapiro-Wilk data: ", shapiro(filtered_data1))
                messagebox.showinfo("Shapiro-Wilk data: ", shapiro(filtered_data1))
            except Exception as e:
                print(f"Error analyzing data: {e}")
                messagebox.showerror("Error", "An error occurred while analyzing the data: Shapiro-Wilk Test. Please select the appropriate data type.")
    elif column_name1 and column_name1 in uploaded_data.columns and test_name == "One Sample T-Test": #One Sample T-Test
        try: 
            global popmean
            popmean = simpledialog.askfloat("Input Required", "Pleasse enter a population mean to test against: ")
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
    else:
        messagebox.showwarning("Warning", "Please select a valid column with the appropriate data type.")
          



#Display Data Function
def displaydata():
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




#Buttons
ttk.Button(frm, text = "Upload", command = selectfile).grid(column = 1, row = 1) #Upload Button
ttk.Button(frm, text = "Submit", command = uploadfile ).grid(column = 1, row = 2) #Submit Button
ttk.Button(frm, text = "Analyze", command = analyzedata).grid(column = 2, row = 10) #Analyze button
ttk.Button(frm, text = "Display Data", command = displaydata, ).grid(column = 2, row = 13) #Button for Displaying Data


root.mainloop() #Starts application event loop: keeping the window open and interactive until user closes






#SERVER

#Initialize Flask Class and Allow Cross-Origin Requests
app = Flask(_name_)
CORS(app) 

@app.route('/api/data', methods = ['GET', 'POST'])
def handle_data():
    if methods == 'GET':
        return jsonify()

    elif methods == 'POST':
        return jsonify()







