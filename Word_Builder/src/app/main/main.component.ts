import { Component, OnInit, OnDestroy } from '@angular/core';
import { CommonModule } from '@angular/common';
@Component({
selector: 'app-main',
templateUrl: './main.component.html',
styleUrls: ['./main.component.css'],
standalone: true,
imports: [CommonModule]
})
export class MainComponent implements OnInit, OnDestroy {
words: string[] = [];
currentWord: string = '';
definition: string = '';
difficulty: string = 'easy'; // Default difficulty level
username: string | null = null;
private modal: HTMLDivElement | null = null; // Declares modal variable
private clickSound: HTMLAudioElement | null = null; // Declares clickSound variable
private timerInterval: any = null;
private timeRemaining: number = 60; // Timer starts from 60 seconds
private balanceTime: number = 0;
private hasIncreasedTime: boolean = false; // Tracks if time has been increased
private plusButton: HTMLElement | null = document.getElementById('plus-button');
score: number = 0;
usedWords: string[] = [];
ngOnInit() {
this.modal = document.getElementById('username-modal') as HTMLDivElement; // Initializes modal
this.clickSound = document.getElementById('click-sound') as HTMLAudioElement; // Initializes click sound element
this.checkLocalStorage();
this.loadScoreFromLocalStorage();
this.setupEventListeners();
this.generateRandomWord();
this.resetProgressBar();
if (this.username) {
this.showWordElements(); // Shows the elements if username exists
if (this.timerInterval) {
clearInterval(this.timerInterval);
}
this.timeRemaining = 60;
this.startTimer(60);
}
const appContainer = document.getElementById('app-container') as HTMLDivElement;
if (appContainer && this.clickSound) {
appContainer.addEventListener('click', () => {
this.clickSound!.play();
});
}
}
ngOnDestroy() {
if (this.timerInterval) {
clearInterval(this.timerInterval);
}
}
private resetProgressBar() {
const progressBar = document.getElementById('progress-bar') as HTMLElement;
const timerText = document.getElementById('timer-text') as HTMLElement;
if (progressBar) {
progressBar.style.width = '0%';
}
if (timerText) {
timerText.textContent = '01:00';
}
}
async checkWordValidity(word: string) {
const apiUrl = `https://api.dictionaryapi.dev/api/v2/entries/en/${word}`;
try {
const response = await fetch(apiUrl);
console.log(response);
if (!response.ok) {
throw new Error('Word not found');
}
const data = await response.json();
console.log(data);
return data.length > 0;
} catch (error) {
console.error(error);
return false;
}
}
async onSubmitWord() {
console.log("Submitting word...");
const inputWord = (document.getElementById('keyword-input') as HTMLInputElement).value.toLowerCase();
const generatedWord = this.currentWord.toLowerCase();
const correctSound = document.getElementById('correct-sound') as HTMLAudioElement;
const wrongSound = document.getElementById('wrong-sound') as HTMLAudioElement;
if (inputWord.length < 3) {
wrongSound?.play();
this.showAlert('Invalid Input', 'Word must be more than 3 letters long.');
return; // Exit the function if the word is too short
}
// Check if the input word is the same as the generated word
if (inputWord === generatedWord) {
wrongSound?.play();
this.showAlert('Invalid Input', 'Original word is not allowed.');
return; // Exit the function if the input word is the generated word
}
const isValid = await this.checkWordValidity(inputWord);
if (isValid && this.canBeFormedFromGeneratedWord(inputWord, generatedWord) && !this.isDuplicate(inputWord)) {
correctSound?.play(); // Play correct sound
this.addWordToCanvas(inputWord);
this.updateUsedWords(inputWord);
} else {
wrongSound?.play();
this.showAlert('Invalid Word', 'Invalid word or rules violated.');
}
(document.getElementById('keyword-input') as HTMLInputElement).value = '';
}
// Helper to check if the word can be formed from generated word
canBeFormedFromGeneratedWord(word: string, generatedWord: string) {
console.log(`Checking if "${word}" can be formed from "${generatedWord}"`);
const letterCount: any = {};
for (let letter of generatedWord) {
letterCount[letter] = (letterCount[letter] || 0) + 1;
}
for (let letter of word) {
if (!letterCount[letter]) {
return false;
}
letterCount[letter]--;
}
return true;
}
// Helper to check for duplicate words
isDuplicate(word: string) {
console.log(`Checking if "${word}" is a duplicate`);
return this.usedWords.includes(word);
}
// Helper to update the used words array
updateUsedWords(word: string) {
this.usedWords.push(word);
}
// Helper to add a word to the canvas
addWordToCanvas(word: string) {
const canvas = document.getElementById('game-canvas') as HTMLCanvasElement;
const ctx = canvas.getContext('2d')!;
ctx.clearRect(0, 0, canvas.width, canvas.height);
ctx.font = '18px Arial';
ctx.fillStyle = 'white';
ctx.fillText(word, 10, 50 + this.usedWords.length * 30);
this.usedWords.forEach((usedWord, index) => {
ctx.fillText(usedWord, 10, 50 + index * 30);
});
// Finally, add the newly submitted word to the list
ctx.fillText(word, 10, 50 + this.usedWords.length * 30);
this.score += 10;
// Update the score display
this.updateScoreDisplay();
this.triggerCoinRotation();
}
private updateScoreDisplay() {
const scoreElement = document.getElementById('coin-count') as HTMLElement;
if (scoreElement) {
scoreElement.textContent = `${this.score}`;
}
localStorage.setItem('score', this.score.toString());
}
private triggerCoinRotation() {
const coinIcon = document.getElementById('coin-icon') as HTMLElement;
if (coinIcon) {
// Add the rotation class
coinIcon.classList.add('coin-rotate');
// Remove the rotation class after the animation completes
setTimeout(() => {
coinIcon.classList.remove('coin-rotate');
}, 500); // Duration of the animation in milliseconds
}
}
startTimer(duration: number) {
const timerText = document.getElementById('timer-text') as HTMLElement;
const progressBar = document.getElementById('progress-bar') as HTMLElement;
// Clear any previous intervals
if (this.timerInterval) {
clearInterval(this.timerInterval);
}
// Set the initial time remaining to the provided duration
this.timeRemaining = duration; // Use class property
// Initially set the timer text
timerText.textContent = this.formatTime(this.timeRemaining); // Initial text
progressBar.style.width = '0%'; // Start with 0% width
progressBar.style.backgroundColor = '#dc720f'; // Fixed color
// Add event listener for plus button click
this.plusButton?.addEventListener('click', () => {
this.storeBalanceTime(); // Store the time when button is clicked
});
// Start the countdown
this.timerInterval = setInterval(() => {
if (this.timeRemaining > 0) {
this.timeRemaining--;
// Update the timer text
timerText.textContent = `${this.formatTime(Math.floor(this.timeRemaining / 60))}:${this.formatTime(this.timeRemaining % 60)}`;
// Store the current timeRemaining in balanceTime as it decrements
this.balanceTime = this.timeRemaining; // This line stores the updated timeRemaining
// Calculate the progress percentage based on elapsed time
const elapsedPercentage = ((duration - this.timeRemaining) / duration); // Calculate elapsed time percentage
progressBar.style.width = `${elapsedPercentage * 100}%`; // Fill bar width progressively
} else {
clearInterval(this.timerInterval); // Stop the timer when it reaches 0
timerText.textContent = '00:00'; // Display 00:00 when time is up
progressBar.style.width = '100%'; // Set progress bar to full when time is up
progressBar.style.backgroundColor = '#cb9595'; // Change color when finished
console.log("Countdown finished!");
this.showTimesUpModal();
}
}, 1000);
}
// Function to store balance time when plus button is clicked
private storeBalanceTime() {
console.log(`Plus button clicked at balance time: ${this.balanceTime}`);
}
// Utility function to format time
private formatTime(time: number): string {
return time < 10 ? `0${time}` : time.toString();
}
setDifficulty(difficultyLevel: string) {
this.difficulty = difficultyLevel;
this.generateRandomWord(); // Generate a new word when difficulty change
this.disableKeywordInput();
if (this.timerInterval) {
clearInterval(this.timerInterval);
}
// Reset the timer to 60 seconds and restart the countdown
this.timeRemaining = 60; // Reset the timer to 60 seconds
}
// Fetch a random word from the Random Word API
async generateRandomWord() {
this.hasIncreasedTime = false;
const lengthCriteria = this.getLengthCriteria(this.difficulty);
try {
const response = await fetch(`https://random-word-api.herokuapp.com/word?number=10`);
this.words = await response.json();
const filteredWords = this.words.filter(word => {
return word.length >= lengthCriteria.min && word.length <= lengthCriteria.max;
});
if (filteredWords.length === 0) {
console.error('No words found for the selected difficulty level.');
return;
}
const randomIndex = Math.floor(Math.random() * filteredWords.length);
this.currentWord = filteredWords[randomIndex].toUpperCase();
const canvas = document.getElementById('game-canvas') as HTMLCanvasElement;
const ctx = canvas.getContext('2d')!;
ctx.clearRect(0, 0, canvas.width, canvas.height); // Clear the canvas
this.usedWords = [];
this.fetchWordDefinition(this.currentWord);
// Update the HTML elements
if (this.username) {
this.timeRemaining = 60; //    time
this.startTimer(60); // Start the timer only if username is set
}
this.updateWordDisplay();
this.enableKeywordInput();
} catch (error) {
console.error('Error fetching word:', error);
}
}
// Function to fetch the word definition from Free Dictionary API
async fetchWordDefinition(word: string) {
// Construct the URL dynamically using the passed word
const url = `https://api.dictionaryapi.dev/api/v2/entries/en/${word.toLowerCase()}`;
console.log(`Fetching definition for: ${url}`); // Debugging: Log the URL
try {
const response = await fetch(url, {
method: 'GET'
});
if (!response.ok) {
const errorMessage = await response.text(); // Get error message from response
throw new Error(`HTTP error! Status: ${response.status}, Message: ${errorMessage}`);
}
const data = await response.json();
console.log(data); // Log the entire response for debugging
if (data && data.length > 0) {
const firstMeaning = data[0].meanings[0].definitions[0].definition; // Get the definition
this.definition = firstMeaning; // Display definition
} else {
this.definition = 'Definition not found.';
}
this.updateWordDisplay(); // Update display after fetching definition
} catch (error) {
console.error('Error fetching definition:', error);
this.definition = 'Definition not found';
this.updateWordDisplay(); // Update display after error
}
}
// Function to get length criteria based on difficulty level
getLengthCriteria(difficulty: string) {
switch (difficulty) {
case 'easy':
return { min: 8, max: 10 };
case 'medium':
return { min: 11, max: 13 };
case 'hard':
return { min: 14, max: Infinity }; // No upper limit for hard
default:
return { min: 0, max: Infinity }; // Default case
}
}
// Update the displayed word and meaning in the HTML
private updateWordDisplay() {
const generatedWordElement = document.getElementById('generated-word') as HTMLElement;
const wordMeaningElement = document.getElementById('word-meaning') as HTMLElement;
if (generatedWordElement && wordMeaningElement) {
generatedWordElement.innerHTML = `<h2>${this.currentWord}</h2>`;
wordMeaningElement.innerHTML = `<p>${this.definition}</p>`;
}
}
private checkLocalStorage() {
this.username = localStorage.getItem('username');
if (!this.username) {
this.showPopup();
} else {
this.updateUsernameDisplay();
}
}
private showPopup() {
if (this.modal) {
const input = document.getElementById('username-input') as HTMLInputElement;
input.value = ''; // Clear the input field
this.modal.style.display = 'block'; // Use the modal variable
}
}
private setupEventListeners() {
const closeButton = document.getElementById('close-button');
const submitButton = document.getElementById('submit-username');
closeButton?.addEventListener('click', () => {
this.closePopup();
});
submitButton?.addEventListener('click', () => {
this.saveUsername();
});
const plusButton = document.getElementById('plus-button') as HTMLButtonElement;
plusButton?.addEventListener('click', () => {
this.increaseTimer();
});
}
increaseTimer() {
// Do not allow time increase for easy difficulty
if (this.difficulty === 'easy') {
return; // Exit the function if difficulty is easy
}
// Allow time increase only once for medium and hard
if (this.hasIncreasedTime) {
return; // Exit the function if time has already been increased
}
// Increase the time based on difficulty
if (this.difficulty === 'medium') {
this.timeRemaining += 15; // Add 15 seconds
} else if (this.difficulty === 'hard') {
this.timeRemaining += 30; // Add 30 seconds
}
// Set the flag to true to prevent further increases
this.hasIncreasedTime = true;
// Call startTimer with the updated time
this.startTimer(this.timeRemaining);
}
private closePopup() {
if (this.modal) {
this.modal.style.display = 'none'; // Use the modal variable
if (!this.username) {
this.username = 'User'; // Default name
localStorage.setItem('username', this.username); // Save it to localStorage
this.updateUsernameDisplay(); // Update the displayed username
}
this.showWordElements();
this.startTimer(60);
}
}
private saveUsername() {
const input = document.getElementById('username-input') as HTMLInputElement;
const username = input.value.trim();
if (username) {
localStorage.setItem('username', username);
this.username = username; // Update the username in the component
this.updateUsernameDisplay(); // Update the displayed username
this.closePopup();
this.showWordElements();
} else {
alert("Please enter a valid name.");
}
}
private showWordElements() {
const generatedWordElement = document.getElementById('generated-word');
const wordMeaningElement = document.getElementById('word-meaning');
const keywordInputContainer = document.getElementById('keyword-input-container');
if (generatedWordElement) {
generatedWordElement.style.display = 'block'; // Show the generated word element
}
if (wordMeaningElement) {
wordMeaningElement.style.display = 'block'; // Show the word meaning element
}
if (keywordInputContainer) {
keywordInputContainer.style.display = 'block'; // Show the keyword input container
}
}
private updateUsernameDisplay() {
const usernameElement = document.getElementById('username') as HTMLElement; // Directly use document.getElementById
if (this.username) {
usernameElement.textContent = this.username; // Update with the username
} else {
usernameElement.textContent = ''; // Clear it if no username is set
}
}
private showTimesUpModal() {
const timesUpModal = document.getElementById('times-up-modal') as HTMLDivElement;
const finalCoinCount = document.getElementById('final-coin-count') as HTMLElement;
if (timesUpModal && finalCoinCount) {
finalCoinCount.textContent = `${this.score}`; // Show the score in the modal
timesUpModal.style.display = 'block'; // Display the modal
}
// Add event listener for the close button
const closeButton = document.getElementById('close-times-up-button');
closeButton?.addEventListener('click', () => {
location.reload();
});
// Add event listener for the continue button
const continueButton = document.getElementById('continue-button');
continueButton?.addEventListener('click', () => {
location.reload(); // Reload the page
});
}
// Load score from local storage
private loadScoreFromLocalStorage() {
const storedScore = localStorage.getItem('score');
this.score = storedScore ? parseInt(storedScore) : 0; // Initialize score
this.updateScoreDisplay(); // Update display with the loaded score
}
private showAlert(title: string, message: string) {
const alertTitle = document.getElementById('alert-title') as HTMLElement;
const alertMessage = document.getElementById('alert-message') as HTMLElement;
const alertModal = document.getElementById('alert-modal') as HTMLDivElement;
if (alertTitle && alertMessage && alertModal) {
alertTitle.textContent = title;
alertMessage.textContent = message;
alertModal.style.display = 'block';
}
// Add event listeners for closing the modal
const closeAlertButton = document.getElementById('close-alert-button') as HTMLElement;
const confirmAlertButton = document.getElementById('confirm-alert-button') as HTMLElement;
closeAlertButton?.addEventListener('click', () => {
alertModal.style.display = 'none';
});
confirmAlertButton?.addEventListener('click', () => {
alertModal.style.display = 'none';
});
}
private disableKeywordInput() {
const keywordInput = document.getElementById('keyword-input') as HTMLInputElement;
if (keywordInput) {
keywordInput.disabled = true; // Disable the input
}
}
private enableKeywordInput() {
const keywordInput = document.getElementById('keyword-input') as HTMLInputElement;
if (keywordInput) {
keywordInput.disabled = false; // Enable the input
}
}
}