const $ = document.querySelector.bind(document)
const $$ = document.querySelectorAll.bind(document)

const weatherForm = $('.weather-main__form')
const weatherSearch = $('.weather-main__input')
const weatherSearchBtn = $('.weater-main__icon-search')
const weatherSearchMessage = $('.weather-main__message')
const weatherMoreList = $('.weather-more__list')
const weatherMoreItems = $$('.weather-more__item')
const weatherMoreNav = $('.weather-more__navigation')

const API_KEY = "0e6f7e538153df0f2d2fda3ae31b57b5"
const DEFAULT_VALUE =  "--"

const weather = {
	weatherMoreBtnLength: 1,
	weatherMoreBtnWidth: 0,
	weatherCity: JSON.parse(localStorage.getItem('weatherCity')) || {},
	cityName: "Ha Noi",
	lang: 'vi',
	months: [
		"January",
		"February",
		"March",
		"April",
		"May",
		"June",
		"July",
		"August",
		"September",
		"October",
		"November",
		"December"
	],
	month: 'January',
	day: 1,
	message: '',

	handleEvents: function () {
		const _this = this
		
		// Tạo nút chuyển thông tin thời tiết
		if(weatherMoreItems.length > 3) {
			this.weatherMoreBtnLength =
				Math.ceil(weatherMoreItems.length / 2)

			this.weatherMoreBtnWidth =
				weatherMoreItems[0].clientWidth

			_this.createWeatherMoreBtns(this.weatherMoreBtnLength)
		}


		// Xử lý khi nút chuyển thông tin thời tiết được click
		const weatherMoreBtns = $$('.weather-more__nav-item')
		weatherMoreBtns[0].classList.add('active')
		Array.from(weatherMoreBtns).forEach(btn => {
			btn.onclick = function () {
				_this.weatherMoreBtnClick(btn)
			}
		})

		weatherForm.onsubmit = function (e) {
			e.preventDefault()
		}

		weatherSearch.oninput = function () {
			if(weatherSearch.value !== '')
				_this.cityName = weatherSearch.value
		}

		weatherSearchBtn.onclick = function () {
			if(_this.cityName && _this.cityName !== '') {
				weatherSearch.value = ''
				_this.fetchApiWeather(_this.cityName, _this.lang)
			}
		}

		document.onkeyup = function (key) {
			if(key.keyCode === 13) {
				if(_this.cityName && _this.cityName !== '') {
					weatherSearch.value = ''
					_this.fetchApiWeather(_this.cityName, _this.lang)
				}
			}
		}

		if(this.weatherCity !== {})	{
			this.render(this.weatherCity)
		}
	},

	convertUnixTimestampToTime: function (unix_timestamp) {
		const date = new Date(unix_timestamp * 1000);
		const hours = date.getHours();
		const minutes = "0" + date.getMinutes();
		const formattedTime = hours + ':' + minutes.substr(-2);
		return formattedTime
	},

	createWeatherMoreBtns: function (length) {
		for (var i = 0; i < length; i++) {
			const weatherMoreBtn =
				document.createElement('span')

			weatherMoreBtn.classList.add('weather-more__nav-item')
			weatherMoreBtn.setAttribute('data-index', i)
			weatherMoreNav.appendChild(weatherMoreBtn)
		}
	},

	weatherMoreBtnClick: function (btn) {
		if(!btn.classList.contains('active')) {
			$('.weather-more__nav-item.active').classList.remove('active')
			btn.classList.add('active')
			const index = Number(btn.dataset.index) * 2
			weatherMoreList.style.transform =
				`translateX(-${weatherMoreItems[index].offsetLeft}px)`
		}

	},

	fetchApiWeather: function (cityName, lang) {
		const _this = this
		const url =
			`https://api.openweathermap.org/data/2.5/weather?q=${cityName}&appid=${API_KEY}&lang=${lang}&units=metric`
		fetch(url)
			.then(response => response.json())
			.then(data => {
				if(data.cod === 200) {
					localStorage.setItem('weatherCity', JSON.stringify(data))
					_this.render(data)
				}
				else if(data.cod === "404") {
					_this.showErrors(data.message)

				}
			})
	},

	autoNextSlide: function () {
		const weatherMoreBtns = $$('.weather-more__nav-item')
		const ActiveweatherMoreBtn = $('.weather-more__nav-item.active')
		const nodeNext = ActiveweatherMoreBtn.nextElementSibling
		ActiveweatherMoreBtn.classList.remove('active')
		if(nodeNext) {
			nodeNext.classList.add('active')
			const index = Number(nodeNext.dataset.index) * 2
			weatherMoreList.style.transform =
				`translateX(-${weatherMoreItems[index].offsetLeft}px)`
		}
		else {
			weatherMoreBtns[0].classList.add('active')
			weatherMoreList.style.transform = 'translateX(0)'
		}
	},

	showErrors: function (err) {
		weatherSearch.value = this.cityName
		weatherSearchMessage.innerText = err
		weatherSearchMessage.style.animationName = 'upToTop'
		setTimeout(() => {
			weatherSearchMessage.style.animationName = 'dropDown'
		}, 3000)
	},

	render: function (data) {
		const today = new Date()
		this.month = today.getMonth()
		this.day = today.getDate()

		// weather main
		$('.weather-main__status-img').src =
			`https://openweathermap.org/img/wn/${data.weather[0].icon}@2x.png` || 'https://openweathermap.org/img/wn/03d@2x.png'
		$('.weather-main__temperature').innerText = Math.round(data.main.temp) || DEFAULT_VALUE
		$('.weather-main__name').innerText = data.weather[0].description || DEFAULT_VALUE
		$('.weather-main__city').innerText = data.name || ''
		$('.weather-main__country').innerText = `, ${data.sys.country}` || DEFAULT_VALUE
		$('.weather-main__month').innerText = this.months[this.month] || DEFAULT_VALUE
		$('.weather-main__day').innerText = this.day || DEFAULT_VALUE

		// weather more
		$('.weather-more__sunrise .weather-more__desc').innerText =
			this.convertUnixTimestampToTime(data.sys.sunrise) || DEFAULT_VALUE
		$('.weather-more__sunset .weather-more__desc').innerText =
			this.convertUnixTimestampToTime(data.sys.sunset) || DEFAULT_VALUE
		
		$('.weather-more__humidity .weather-more__desc').innerText = `${data.main.humidity}%` || DEFAULT_VALUE
		$('.weather-more__wind .weather-more__desc').innerText = `${(data.wind.speed * 3.6).toFixed(2)} Km/h` || DEFAULT_VALUE
		$('.weather-more__temp-min .weather-more__desc').innerHTML = `${Math.round(data.main.temp_min)}&deg;` || DEFAULT_VALUE
		$('.weather-more__temp-max .weather-more__desc').innerHTML = `${Math.round(data.main.temp_max)}&deg;` || DEFAULT_VALUE
		$('.weather-more__feels-like .weather-more__desc').innerHTML = `${Math.round(data.main.feels_like)}&deg;` || DEFAULT_VALUE
	},

	start: function () {
		this.handleEvents()
	}
}


document.addEventListener("DOMContentLoaded", () => {
	weather.start()
	setInterval(() => {
		weather.autoNextSlide()
	}, 3000)
})