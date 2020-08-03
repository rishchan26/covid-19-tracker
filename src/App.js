import React, { useState, useEffect } from 'react';
import {
    MenuItem,
    FormControl,
    Select, 
    Card,
    CardContent
} from "@material-ui/core";
import InfoBox from './InfoBox';
import Map from './Map';
import Table from './Table';
import LineGraph from './LineGraph'
import {sortData, prettyPrintStat} from './util';
import numeral from 'numeral';
import './App.css';
import "leaflet/dist/leaflet.css"

function App() {

    const [countries, setCountries] = useState([]);
    const [country, setCountry] = useState('worldwide');
    const [countryInfo, setCountryInfo] = useState({});
    const [tableData, setTableData] = useState([]);
    const [mapCenter, setMapCenter] = useState( {lat: 40.52, lng: 34.34} );
    const [mapZoom, setMapZoom] = useState(1.5);
    const [mapCountries, setMapCountries] = useState([]);
    const [casesType, setCasesType] = useState("cases");

    useEffect(() => {
        const url = 'https://disease.sh/v3/covid-19/all';
        fetch(url)
        .then(response => response.json())
        .then((data) => {
            setCountryInfo(data);
        });
    }, []);

    useEffect(() => {
        const getCountriesData = async () => {
            await fetch("https://disease.sh/v3/covid-19/countries")
            .then((response) => response.json())
            .then((data) => {
            const countries = data.map((country) => (
                {
                    name: country.country,
                    value: country.countryInfo.iso2
                }
                ));
                const sortedData = sortData(data);
                setTableData(sortedData);
                setCountries(countries);
                setMapCountries(data);
            });
        };
        getCountriesData();
    }, []);

    const onCountryChange = async (event) => {
        const countryCode = event.target.value;

        const url = countryCode === 'worldwide' ? 'https://disease.sh/v3/covid-19/all' : `https://disease.sh/v3/covid-19/countries/${countryCode}`;
        await fetch(url)
        .then(response => response.json())
        .then((data) => {
            setCountry(countryCode);
            setCountryInfo(data);
            countryCode === 'worldwide' ? setMapZoom(1.5) :setMapZoom(4);
            countryCode === 'worldwide' ? setMapCenter({lat: 40.52, lng: 34.34}) : setMapCenter([data.countryInfo.lat, data.countryInfo.long]);
        });
    }

    return (
        <div className="app">

            <div className="app__left">
                <div className="app__header">
                    <h1>COVID 19 Tracker</h1>
                    <FormControl class="app__dropdown">
                        <Select variant="outlined" value ={country} onChange={onCountryChange}>
                        <MenuItem value="worldwide">Worldwide</MenuItem>
                        {countries.map((country) => <MenuItem value={country.value}>{country.name}</MenuItem>)}
                        </Select>
                    </FormControl>
                </div>
                <div className="app__stats">
                    <InfoBox active={casesType === 'cases'} onClick={e => setCasesType('cases')} title="Coronavirus Cases" total={numeral(countryInfo.cases).format("0,0")} cases={prettyPrintStat(countryInfo.todayCases)}/>
                    <InfoBox active={casesType === 'recovered'} onClick={e => setCasesType('recovered')} title="Recovered" total={numeral(countryInfo.recovered).format("0,0")} cases={prettyPrintStat(countryInfo.todayRecovered)}/>
                    <InfoBox active={casesType === 'deaths'} onClick={e => setCasesType('deaths')} title="Deaths" total={numeral(countryInfo.deaths).format("0,0")} cases={prettyPrintStat(countryInfo.todayDeaths)}/>
                </div>
                <Map casesType={casesType} countries={mapCountries} center={mapCenter} zoom={mapZoom}/>
            </div>

            <Card className="app__right">
                <CardContent>
                    <h3>Live cases by country</h3>
                    <Table countries={tableData}/>
                    <h3>Worldwide new {casesType}</h3>
                    <LineGraph className="app__graph" casesType={casesType}/>
                </CardContent>
            </Card>
    
        </div>
    );
}

export default App;
