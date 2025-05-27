print("Script is running...")
import numpy as np
import scipy as sp
import scipy.stats as stats
import matplotlib.pyplot as plt
import seaborn as sns
import pandas as pd
import mysql.connector 
from mysql.connector import (connection)


#Connect to Database
try:
    db = connection.MySQLConnection(
        host="localhost",
        port=3306,
        user="root",
        password="Frambleton3!",
        database="ecommercedb"
    )
    if db.is_connected():
           print("Connected to the database")
        
    #Create cursor object to query data
    cursor = db.cursor()
    #Query/Select data from table
    cursor.execute("SELECT * FROM products")


    #Fetch all rows from the result of the query
    rows = cursor.fetchall()
    #Process and display data
    for row in rows:
        print(row)
    
    #Specific Queries

    #Prices
    cursor.execute("SELECT Price FROM products")
    #Fetch Prices
    price_rows = cursor.fetchall()
    #Store data in variable
    prices = [row[0] for row in price_rows]


#CSV File Data

#Statistical Methods
    #Mean
    print("The average price is:", np.mean(prices))
    #Shapiro-Wilk
    print("Shapiro-Wilks Test:", sp.stats.shapiro(prices))


#Data Display
    #Q-Q Plot
    plt.figure(figsize=(12,6))
    plt.subplot(1, 2, 1)
    stats.probplot(prices, dist = "norm", plot = plt)
    plt.title("Q-Q Plot for Prices")

    #Histogram with KDE
    plt.subplot(1, 2, 2)
    sns.histplot(prices, kde = True, stat = "density", linewidth = 0)
    plt.title("Histogram with Density Plot")
    plt.xlabel("Price")
    plt.ylabel("Density")

    plt.tight_layout()
    plt.show()

except connection.Error as err:
    print(f"Error: {err}")

finally:
    if db.is_connected():
        cursor.close()
        db.close()
        print("Database connection closed.")
