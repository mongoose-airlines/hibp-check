const baseUrl = "https://api.pwnedpasswords.com/range/"

const submitButton = document.querySelector("#submitButton")
const passwordInput = document.querySelector("#passwordInput")
const message = document.querySelector("#message")

submitButton.addEventListener("click", checkPassword)

async function checkPassword(){
  const password = passwordInput.value
  const hashedPassword = new Hashes.SHA1().hex(password).toUpperCase()
  const firstFive = hashedPassword.substring(0, 5).toUpperCase()
  const hidpResults = await retrieveHibpResults(firstFive)
  if(Array.isArray(hidpResults)){
    const searchResult = binarySearch(hidpResults, hashedPassword)
    renderResult(searchResult, hidpResults)
  } else {
    renderResult("Oh no, something went wrong!")
  }
}

async function retrieveHibpResults(firstFive) {
  try {
    return await fetch(`${baseUrl}${firstFive}`, {mode: "cors"})
    .then(res => res.text())
    .then(text => text.split('\n'))
    .then(results => {
      const hashes = results.map(item => {
        const hash = firstFive.concat("", item.split(":")[0])
        return ({
          hash: hash,
          count: parseInt(item.split(":")[1], 10)
        })
      })
      return hashes
    })
  } catch (err) {
    return err
  }
}

function binarySearch(arr, element){
  let start = 0
  let end = arr.length - 1
  let midPoint = Math.floor((start + end) / 2)

  while(arr[midPoint].hash !== element && start < end) {
    console.log(arr[midPoint].hash)
    if (element < arr[midPoint].hash) {
        end = midPoint - 1
    } else {
        start = midPoint + 1
    }
    midPoint = Math.floor((start + end) / 2)
  }
  return (arr[midPoint].hash !== element) ? -1 : midPoint
}

function renderResult(match, results) {
  console.log(match)
  if(isNaN(match)){
    message.classList.remove("ok", "warn")
    message.classList.add("err")
    message.textContent = match
  } else if (match === -1){
    message.classList.remove("warn", "err")
    message.classList.add("ok")
    message.textContent = "This password has not appeared in a data breach according to haveibeenpwned.com. "
  } else {
    message.classList.remove("ok", "err")
    message.classList.add("warn")
    message.textContent = `This password has appeared in data breaches ${results[match].count} times according to haveibeenpwned.com. You should probably not use it!`
  }
}
