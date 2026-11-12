import { useEffect, useMemo, useState } from 'react'
import { Search, MapPin, Wind, Droplets, Thermometer, Sunrise, Sunset, CloudRain, Sun, Cloud, CloudSun, LocateFixed, RefreshCw } from 'lucide-react'

const GEO = 'https://geocoding-api.open-meteo.com/v1/search'
const API = 'https://api.open-meteo.com/v1/forecast'

function weatherInfo(code) {
  if (code === 0) return { label: 'Céu limpo', icon: Sun, theme: 'sunny' }
  if ([1, 2].includes(code)) return { label: 'Parcialmente nublado', icon: CloudSun, theme: 'partly' }
  if (code === 3) return { label: 'Nublado', icon: Cloud, theme: 'cloudy' }
  if ([45, 48].includes(code)) return { label: 'Neblina', icon: Cloud, theme: 'cloudy' }
  if ([51, 53, 55, 56, 57].includes(code)) return { label: 'Garoa', icon: CloudRain, theme: 'rainy' }
  if ([61, 63, 65, 66, 67, 80, 81, 82].includes(code)) return { label: 'Chuva', icon: CloudRain, theme: 'rainy' }
  if ([71, 73, 75, 77, 85, 86].includes(code)) return { label: 'Neve', icon: Cloud, theme: 'cold' }
  if ([95, 96, 99].includes(code)) return { label: 'Trovoadas', icon: CloudRain, theme: 'storm' }
  return { label: 'Condição variável', icon: CloudSun, theme: 'partly' }
}

function formatDay(date) {
  return new Intl.DateTimeFormat('pt-BR', { weekday: 'short', day: '2-digit', month: 'short' }).format(new Date(`${date}T12:00:00`))
}
function timeOnly(value) { return value ? value.slice(11, 16) : '--:--' }

export default function App() {
  const [city, setCity] = useState('Salvador')
  const [query, setQuery] = useState('')
  const [place, setPlace] = useState({ name: 'Salvador', admin1: 'Bahia', country: 'Brasil', latitude: -12.9714, longitude: -38.5014 })
  const [weather, setWeather] = useState(null)
  const [loading, setLoading] = useState(false)
  const [error, setError] = useState('')

  async function loadWeather(location = place) {
    setLoading(true); setError('')
    try {
      const params = new URLSearchParams({
        latitude: location.latitude, longitude: location.longitude,
        current: 'temperature_2m,relative_humidity_2m,apparent_temperature,is_day,precipitation,weather_code,wind_speed_10m',
        hourly: 'temperature_2m,precipitation_probability,weather_code',
        daily: 'weather_code,temperature_2m_max,temperature_2m_min,sunrise,sunset,precipitation_probability_max',
        timezone: 'auto', forecast_days: '5'
      })
      const response = await fetch(`${API}?${params}`)
      if (!response.ok) throw new Error('Não foi possível consultar a previsão agora.')
      setWeather(await response.json())
    } catch (e) { setError(e.message || 'Erro ao carregar os dados do clima.') }
    finally { setLoading(false) }
  }

  async function searchCity(e) {
    e?.preventDefault()
    const term = query.trim()
    if (!term) return
    setLoading(true); setError('')
    try {
      const response = await fetch(`${GEO}?name=${encodeURIComponent(term)}&count=1&language=pt&format=json`)
      const data = await response.json()
      if (!data.results?.length) throw new Error('Cidade não encontrada. Tente outro nome.')
      const p = data.results[0]
      const next = { name: p.name, admin1: p.admin1 || '', country: p.country || '', latitude: p.latitude, longitude: p.longitude }
      setPlace(next); setCity(next.name); setQuery('')
      await loadWeather(next)
    } catch (e) { setError(e.message || 'Não foi possível buscar essa cidade.'); setLoading(false) }
  }

  useEffect(() => { loadWeather(place) }, []) // eslint-disable-line react-hooks/exhaustive-deps

  const current = weather?.current
  const daily = weather?.daily
  const nowInfo = weatherInfo(current?.weather_code ?? 1)
  const WeatherIcon = nowInfo.icon
  const hourlyItems = useMemo(() => {
    if (!weather?.hourly) return []
    const { time, temperature_2m, precipitation_probability, weather_code } = weather.hourly
    const currentTime = current?.time || ''
    let start = time.findIndex(t => t >= currentTime)
    if (start < 0) start = 0
    return Array.from({ length: 8 }, (_, i) => {
      const idx = Math.min(start + i * 3, time.length - 1)
      return { time: time[idx], temp: temperature_2m[idx], rain: precipitation_probability[idx], code: weather_code[idx] }
    })
  }, [weather, current?.time])

  return (
    <main className={`app theme-${nowInfo.theme}`}>
      <div className="ambient ambient-one" /><div className="ambient ambient-two" />
      {nowInfo.theme.includes('rain') || nowInfo.theme === 'storm' ? <div className="rain-layer" aria-hidden="true">{Array.from({length: 34}, (_,i)=><i key={i} style={{left:`${(i*37)%100}%`, animationDelay:`-${(i%9)*.7}s`, animationDuration:`${1.3+(i%5)*.25}s`}} />)}</div> : null}
      <div className="shell">
        <header className="topbar">
          <a className="brand" href="#"><span className="brand-mark"><CloudSun size={22}/></span><span>Api<span>Meteo</span></span></a>
          <div className="live-label"><span className="live-dot" /> DADOS METEOROLÓGICOS AO VIVO</div>
          <button className="refresh" onClick={() => loadWeather()} title="Atualizar previsão"><RefreshCw size={17}/></button>
        </header>

        <section className="hero">
          <div className="hero-copy">
            <p className="eyebrow">PREVISÃO INTELIGENTE</p>
            <h1>O clima da sua região,<br/><em>em um só lugar.</em></h1>
            <p className="intro">Acompanhe as condições do tempo e planeje seu dia com informações atualizadas.</p>
            <form className="searchbar" onSubmit={searchCity}>
              <Search size={19}/><input value={query} onChange={e=>setQuery(e.target.value)} placeholder="Buscar cidade..." aria-label="Buscar cidade"/>
              <button type="submit" disabled={loading}>{loading ? 'Buscando' : 'Buscar'}</button>
            </form>
            {error && <p className="error">{error}</p>}
          </div>
          <div className="globe-card">
            <div className="globe-orbit orbit-a"/><div className="globe-orbit orbit-b"/>
            <div className="globe"><div className="globe-grid"/><div className="globe-land land-a"/><div className="globe-land land-b"/><div className="globe-shine"/></div>
            <div className="globe-caption"><span className="live-dot"/> MONITORAMENTO GLOBAL</div>
            <span className="globe-coord">🌎 {place.latitude.toFixed(2)}°, {place.longitude.toFixed(2)}°</span>
          </div>
        </section>

        <section className="location-row">
          <div><div className="location-name"><MapPin size={18}/>{place.name}</div><p>{[place.admin1, place.country].filter(Boolean).join(', ')}</p></div>
          <div className="updated">{current?.time ? `Atualizado às ${timeOnly(current.time)}` : 'Carregando dados...'}</div>
        </section>

        <section className="weather-grid">
          <article className="current-card glass">
            <div className="card-top"><span>AGORA</span><span className="condition-pill">{nowInfo.label}</span></div>
            <div className="current-main">
              <div><div className="temperature">{current ? Math.round(current.temperature_2m) : '--'}<sup>°</sup></div><div className="feels">Sensação de {current ? Math.round(current.apparent_temperature) : '--'}°</div></div>
              <WeatherIcon className="big-weather-icon" strokeWidth={1.3}/>
            </div>
            <div className="current-footer">
              <div><Thermometer/><span><b>{current ? Math.round(current.apparent_temperature) : '--'}°</b><small>Sensação</small></span></div>
              <div><Droplets/><span><b>{current?.relative_humidity_2m ?? '--'}%</b><small>Umidade</small></span></div>
              <div><Wind/><span><b>{current?.wind_speed_10m ?? '--'} km/h</b><small>Vento</small></span></div>
            </div>
          </article>
          <article className="sun-card glass">
            <div className="card-top"><span>DETALHES DO DIA</span><span className="mini-label">HOJE</span></div>
            <div className="sun-detail"><span className="sun-icon sunrise"><Sunrise/></span><span><small>Nascer do sol</small><b>{timeOnly(daily?.sunrise?.[0])}</b></span><span className="sun-line"/></div>
            <div className="sun-detail"><span className="sun-icon sunset"><Sunset/></span><span><small>Pôr do sol</small><b>{timeOnly(daily?.sunset?.[0])}</b></span><span className="sun-line"/></div>
            <div className="rain-chance"><CloudRain/><span>Chance máxima de chuva</span><b>{daily?.precipitation_probability_max?.[0] ?? '--'}%</b></div>
          </article>
        </section>

        <section className="section-block">
          <div className="section-heading"><div><p className="eyebrow">PRÓXIMAS HORAS</p><h2>Previsão horária</h2></div><span>Próximas 24 horas</span></div>
          <div className="hourly glass">
            {hourlyItems.length ? hourlyItems.map((item,i)=>{const I=weatherInfo(item.code).icon;return <div className={`hour-item ${i===0?'hour-now':''}`} key={item.time}><small>{i===0?'Agora':timeOnly(item.time)}</small><I/><b>{Math.round(item.temp)}°</b><span><Droplets size={12}/>{item.rain ?? 0}%</span></div>}) : <p className="loading-text">Carregando previsão horária...</p>}
          </div>
        </section>

        <section className="section-block">
          <div className="section-heading"><div><p className="eyebrow">PLANEJE-SE</p><h2>Próximos 5 dias</h2></div><span>Previsão estendida</span></div>
          <div className="daily-list glass">
            {daily?.time?.map((date,i)=>{const I=weatherInfo(daily.weather_code[i]).icon;return <div className="daily-item" key={date}><b>{i===0?'Hoje':formatDay(date)}</b><I/><span>{weatherInfo(daily.weather_code[i]).label}</span><div className="temp-range"><b>{Math.round(daily.temperature_2m_max[i])}°</b><span/><small>{Math.round(daily.temperature_2m_min[i])}°</small></div><div className="daily-rain"><Droplets size={14}/>{daily.precipitation_probability_max[i] ?? 0}%</div></div>}) || <p className="loading-text">Carregando previsão...</p>}
          </div>
        </section>

        <footer><a className="brand footer-brand" href="#"><span className="brand-mark"><CloudSun size={18}/></span>Api<span>Meteo</span></a><span>Dados meteorológicos por Open-Meteo · Feito para acompanhar seu tempo.</span></footer>
      </div>
    </main>
  )
}