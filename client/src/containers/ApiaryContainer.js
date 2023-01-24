import { useState, useEffect } from 'react'
import { BrowserRouter as Router, Routes, Route } from 'react-router-dom';

import ApiaryList from '../components/Apiaries/ApiaryList';
import ColonyList from '../components/Colonies/ColonyList';
import EditColony from '../components/EditColony';
import EditInspection from '../components/EditInspection';

import NavBar from '../components/NavBar';
import InspectionList from "../components/SingleColony/InspectionList"
import BeeServices from '../services/BeeService';
import SingleColony from '../components/SingleColony/SingleColony';

import './ApiaryContainer.css'

const ApiaryContainer = () => {

    const [apiaryData,setApiaryData] = useState([]);

    const [selectedApiary, setSelectedApiary] = useState(0);

	const [weather,setWeather] = useState([])

    const [colonyData,setColonyData] = useState()

    const [inspection, setInspection] = useState()

    
	useEffect(() => {
		fetch("https://weather.visualcrossing.com/VisualCrossingWebServices/rest/services/timeline/g64%204bu?unitGroup=uk&key=Q86C2HV4D2FX4MKNCXF235DBE&contentType=json")
			.then(res => res.json())
			.then(weatherData => {
                setWeather(weatherData.days.slice(0,5))})
            }, [])

    useEffect(() => {
        BeeServices.getApiaries()
        .then(apiaryDataRaw => {
            setApiaryData(apiaryDataRaw);
        })
    }, [])

    if (!apiaryData) {
        return (
            <h3>Loading...</h3>
        )
    }

    // Functions to add colonies to db, and effect changes to state.
    const addColony = (payload) => {
        BeeServices.addColonies(apiaryData[selectedApiary]._id,payload)
        .then(res => {
            const temp = [...apiaryData];
            temp[selectedApiary].colonies.push(res);
            setApiaryData(temp);
        })
    }

    const editColony = (apiary_id, colony_id, colony) => {
        BeeServices.updateColonies(apiary_id, colony_id, colony)
        .then(res => {
            const temp = [...apiaryData];
            const oldColony = temp[selectedApiary]
            .colonies
            .filter(old_col => old_col._id === colony._id)
            .at(0);
            const index = temp[selectedApiary].colonies.indexOf(oldColony);
            temp[selectedApiary].colonies[index] = res;
            setApiaryData(temp);
        })
    }
    
    const deleteColony = (colony) => {
        BeeServices.deleteColonies(apiaryData[selectedApiary]._id, colony._id)
        .then(res => {
            if (res.status === 200) {
                const temp = [...apiaryData];
                const index = temp[selectedApiary].colonies.indexOf(colony);
                temp[selectedApiary].colonies.splice(index, 1);
                setApiaryData(temp);
            }
        })
    }

    // Functions to add inspections to db and effect changes to state
	const addInspection = (apiary_id, colony_id, inspection) => {
        BeeServices.addInspection(apiary_id, colony_id, inspection)
        .then(res => {
                const temp = [...apiaryData];
                const colony = temp[selectedApiary].colonies.filter(colony => {
                    return colony._id === colony_id;
                })[0]
                const col_index = temp[selectedApiary].colonies.indexOf(colony);
                temp[selectedApiary].colonies[col_index].inspections.push(res);
                setApiaryData(temp);
            })
    }

    // const editInspection = (Inspection, selectedColony) => {
    //     setInspection(Inspection)
    //     setColonyData(selectedColony)
    //     console.log(selectedColony)
    // }

    const editInspection = (payload, colonyData) => {
        // const elementToChange = ['inspectionDate', 'queenSpotted', "broodSpotted", "honeyStores_kg", "hiveHealth", "comments"]
        // const object = {}
        // elementToChange.forEach(element => {
        //     object[element] = payload[element]
        // })
        // const newInspection = Object.assign(inspection, object)
        // console.log('123')
        // console.log(colonyData)
        // console.log(inspection._id)
        // console.log('123')
        // BeeServices.updateInspection(apiaryData[selectedApiary]._id, colonyData, newInspection)
        
        
    }

    const deleteInspection = (inspection, selectedColony) => {
        BeeServices.deleteInspection(apiaryData[selectedApiary]._id, selectedColony, inspection._id)
        .then(res => {
            if (res.status === 200) {
                const temp = [...apiaryData];
                const colony = temp[selectedApiary].colonies.find(element => element._id === selectedColony);
                const colonyIndex = temp[selectedApiary].colonies.indexOf(colony)
                const inspectionIndex =  temp[selectedApiary].colonies[colonyIndex]['inspections'].indexOf(inspection)
                temp[selectedApiary].colonies[colonyIndex]['inspections'].splice(inspectionIndex, 1);
                setApiaryData(temp);
            }
        })
    }

    


    return (
        
        <Router>
            <NavBar /> 
            <Routes>
                <Route path="/" element={<ApiaryList />}/>
                <Route
                    path="/colonies"
                    element={ <ColonyList 
                                    apiaryData={apiaryData[selectedApiary]} 
                                    weather={weather}
                                    addColony={addColony}
                                    deleteColony={deleteColony}
                                    editColony={editColony}
                                />
                            }
                />
                <Route 
                    path="/colonies/:col_id" 
                    element={ <SingleColony 
                                    apiaryData={apiaryData[selectedApiary]}
                                    weather={weather}
                                    addInspection={addInspection}
                                    deleteInspection={deleteInspection}
                                    editInspection={editInspection}
                                /> 
                            } 
                />
                <Route path="/inspections" element={ <InspectionList addInspection={addInspection} apiaryData={apiaryData} editInspection={editInspection} deleteInspection={deleteInspection}/> } />
                <Route 
                    path="/colonies/:col_id/edit" 
                    element={ <EditColony 
                                    apiaryData={apiaryData[selectedApiary]} 
                                    editColony={editColony}
                                /> 
                            } 
                />
                <Route 
                    path="/colonies/:col_id/inspections/:ins_id/edit" 
                    element={ <EditInspection 
                                    apiaryData={apiaryData[selectedApiary]} 
                                    editInspection={editInspection} 
                                />
                            } 
                />
            </Routes>
        </Router>
    )
}

export default ApiaryContainer;