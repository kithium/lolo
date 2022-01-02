import {
    PuzzleGame
} from '../modules/game.js'

import {
    createBoard
} from '../modules/board.js'

if (localStorage.getItem('token') && localStorage.getItem('username')) {
    const signOutBtn = document.querySelector('header button.sign-out')
    document.querySelector('header a.sign-in').classList.add('hidden')

    signOutBtn.onclick = () => {
        localStorage.removeItem('token')
        localStorage.removeItem('username')
        location.reload()
    }

    signOutBtn.textContent = `${localStorage.getItem('username')} | Sign out`

    signOutBtn.classList.remove('hidden')
}

const searchParams = new URLSearchParams(location.search)

const form = document.querySelector('.filters form')
const minRating = form.querySelector('input.min')
const maxRating = form.querySelector('input.max')
const toggleBtns = form.querySelectorAll('.toggle')

const curRating = document.querySelector('.filters > .puzzle-info .puzzle-rating span:last-child')
const curThemes = document.querySelector('.filters > .puzzle-info .puzzle-themes span:last-child')

const newPuzzleBtn = document.querySelector('.filters > .new-puzzle')

const puzzlesFound = document.querySelector('.filters .puzzle-count')

if (searchParams.has('minRating')) {
    minRating.value = searchParams.get('minRating')
}
if (searchParams.has('maxRating')) {
    maxRating.value = searchParams.get('maxRating')
}
if (searchParams.has('themes')) {
    toggleBtns.forEach(btn => {
        const theme = btn.getAttribute('data-theme')
        if (searchParams.get('themes').includes(theme)) {
            btn.classList.add('selected')
        }
    })
}

toggleBtns.forEach(btn => {
    btn.onclick = () => {
        btn.classList.toggle('selected')
    }
})

form.onsubmit = (e) => {
    e.preventDefault()

    const selectedButtons = form.querySelectorAll('.toggle.selected')

    let themeStr = ''

    if (selectedButtons.length > 0) {
        selectedButtons.forEach((button, i) => {
            themeStr += `${button.getAttribute('data-theme')}`
            if (i !== selectedButtons.length - 1) {
                themeStr += ','
            }
        })
    }

    location.search = `?minRating=${minRating.value}&maxRating=${maxRating.value}&themes=${themeStr}`
}



const board = createBoard(document.body)
let game


function solved() {
    setTimeout(() => {
        alert('Congratulations! You solved the puzzle!')
        newPuzzle()
    }, 400)
}

function newPuzzle() {
    if (game) game.stop()
    generatePuzzle()
}

newPuzzleBtn.onclick = newPuzzle


async function generatePuzzle() {

    const puzzle = await getRandomPuzzle()

    if (puzzle.error) {
        alert(puzzle.error)
        return
    }

    curRating.textContent = puzzle.puzzle.rating
    curThemes.textContent = puzzle.puzzle.themes.join(', ')
    puzzlesFound.textContent = puzzle.found + ' puzzles found'

    game = PuzzleGame(puzzle.puzzle, board, solved)

    game.start()
}

async function getRandomPuzzle() {
    const response = await fetch(`${location.protocol}//${location.host}/puzzle/random/${location.search}`)
    const puzzle = await response.json()
    return puzzle
}

generatePuzzle()