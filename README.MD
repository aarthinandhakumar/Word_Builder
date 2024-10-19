**Project Overview**

This project is based on a Word Builder games built using HTML5/CSS/JS with latest Angular framework, which aims to enhance vocabulary skills and provide an engaging and interactive user experience

**Setup Instructions**

 - Download the project file or clone the repository
 - Create/rename your project folder and move the downloaded files to your project folder
 - Copy the project folder path
 - Open command prompt or terminal window
 - Type cd (Path to your project)
 - Run the command npm install
 - Type ng serve
 - Open your browser and enter http://localhost:4200/


**Features**

1. A random word is generated with its meaning (if it is a valid word)
2. Users can form smaller words out of the given word
3. Users can switch the difficulty levels
4. Medium and Hard words provide the option to increase the timer
5. Sound effects for right and wrong answers
6. Dynamic score and timer display with extra visual effects
7. Dynamic display of valid words on the side bar.

**Usage**

1. Once page is loaded, login as User or by entering name
2. By default, easy word is generated with a start time of 60 seconds
3. Form smaller and valid words and click Go
4. Valid words will earn gold coins
5. Change difficulty, as desired.
6. Timer can be increased for Medium and Hard levels

**API Endpoints**

1. Dictionary API endpoint:
   
https://api.dictionaryapi.dev/api/v2/entries/en/{word}


2. Random Word API endpoint:

https://random-word-api.herokuapp.com/word?number=10 


**License**

This project is licensed under the MIT License - see the [LICENSE](License.txt) file for details.