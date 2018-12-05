/* global google */
import React from 'react'

import { render } from 'react-dom';


import API from '../../API'
import './DashBoard.css'
import './Modal/Modal.css'

import { Polygon } from 'react-google-maps';
import MapWithADrawingManager from '../Map/Map'
import Modal from './Modal/Modal'
import BroadCast from '../BroadCast/BroadCast'

import HelpSlide from '../HelpSection/HelpSlide'
import HelpSlideSelector from '../HelpSection/HelpSlideSelector'

import decodeGeoCode from '../HelperFunctions/decodeGeoCode'

const { DrawingManager } = require("react-google-maps/lib/components/drawing/DrawingManager")


const googleMapURL = `https://maps.googleapis.com/maps/api/js?libraries=geometry,drawing&key=AIzaSyDXHHDfZvn2QHX42Uwacjmo1PuVfjBsjI8`;

class DashBoard extends React.Component {


   
    constructor(props) {
        super(props)

        this.state = {
            center: {
              // Flatiron School
              lat: 51.520534,
              lng: -0.087613
            },
            renderMap: false,
            polygon: null,  // ?
            fence: null,
            watchID: null,
            lastFetched: null,
            showModal: false,
            showBroadcastModal: false,
            messageText: "",
            newBroadCastName: "",
            newBroadCastCode: "",
            newBroadCastMessages: [],
            currentBroadcast: null,
            getLastBroadCast: false,
            renderNewMessages: false,
            currentBroadcastPolygons: null,
            polygons: [],
            polygonsCoords: [],
            editModal: false,
            editText: "",
            messageToEdit: null,
            renderEditedMessages: false,
            polygonsToDelete: [],
            selectedPolygon: null,
            polygonsOnMap: [],
            highlight: null,
            renderDeletedMessage: false,
            currentPoly: null,
            doneDrawingPolys: [],
            renderPolygons: true,
            polygonInstances: null,
            renderMapAgain: false,
            errorMessage: null,
            visible: false,

          };
    }

    componentDidMount() {

    
        API.getLastbroadcast()
            .then(broadcast => {
                if (broadcast) {
                    if (broadcast.saved === false ) {
                        this.setState({
                            currentBroadcast: broadcast,
                            newBroadCastMessages: broadcast.messages,
                            polygons: this.getGeoFencesFromBroadCast(broadcast)
                        })
                        // this.setState({ doneDrawingPolys: [...this.state.doneDrawingPolys, this.renderPolygonsOnMap()]})
                    } else {
                        this.setState({ currentBroadcast: null })
                    }
                }
                           
            }) 



    }

    getGeoFencesFromBroadCast = (broadcast) => {
        // console.log("getGeoFencesFromBroadCast")
        let geofenceArray = []
        broadcast.messages.map(message => geofenceArray = [...geofenceArray, message.geofence])
        // console.log("HELLO FROM GET GEOFENCES:", geofenceArray)
        this.makePolygons(geofenceArray)
      }

    
    makePolygons = (geofenceArray) => {
        geofenceArray.map(geofence => {
            const decodedGeofence = decodeGeoCode(geofence)
            // console.log("DECODED GEO-FENCE:", decodedGeofence)
            this.setState({
            polygonsCoords: [...this.state.polygonsCoords, decodedGeofence]
            })
        })
    }

    setSelectedPolygon = (coords) => {

        console.log('setSelectedPolygon', coords)
        
        this.state.newBroadCastMessages.map(message => {
            const one = coords
            const two = decodeGeoCode(message.geofence)
            // console.log(two)
            if (one[0]['lat'] === two[0]['latitude'] && one[0]['lng'] === two[0]['longitude']) {
               this.setState({ highlight: message.id })
               setTimeout(() => {
                this.setState({ highlight: null })
                }, 1000)
            }
        })


    }


    renderPolygonsOnMap = () => {
        if (this.state.renderPolygons === false) {
            this.setState({
                renderPolygons: true
            })
        }

        const formattedPolygons = this.state.polygonsCoords.map((poly, idx) => {
            return poly.map(coord => 
                { return { lat: coord.latitude, lng: coord.longitude } })
        })
        let polygonInstances = []
      
        formattedPolygons.map((coords, idx) =>       

            // (   
            //        <Polygon
            //             onMouseOver={() => this.setSelectedPolygon(coords) }
            //             path={coords}
            //             key={idx}
            //             options={{
            //                 fillColor: "#000",
            //                 fillOpacity: 0.4,
            //                 strokeColor: "#4c75c2",
            //                 strokeOpacity: 1,
            //                 strokeWeight: 1,
            //             }
                       
            //         } /> 
            // )

            (  
                    polygonInstances.push(   <Polygon
                            onMouseOver={() => this.setSelectedPolygon(coords) }
                            path={coords}
                            key={idx}
                            ref={React.createRef()}
                            options={{
                                fillColor: "#000",
                                fillOpacity: 0.4,
                                strokeColor: "#4c75c2",
                                strokeOpacity: 1,
                                strokeWeight: 1,
                            }}
                            {...this.props} /> 
                )
                
            )
      
        )

        console.log("renderPolygonsOnMap", polygonInstances)
        console.log("renderPolygonsOnMap", polygonInstances.key)
        this.setState({ polygonInstances: polygonInstances })
        return polygonInstances
    }


    createNewBroadcast = () => {
        this.setState({ showBroadcastModal: true })
    }

  
	closeModalHandler = () => {
		this.setState({
            showModal: false,
            showBroadcastModal: false
        });
        
        if (this.state.visible) {
            this.setState({
                visible: !this.state.visible
            })
        }
    }

    doneDrawing = polygon => {        
        console.log("DONE DRAWING:", polygon)
        // drawingManager.setDrawingMode(null)
        // if (this.state.polygon) {
        //     this.state.polygon.setMap(null);
        //   }

        if (this.state.currentPoly) {
            this.setState({ currentPoly: null })
        }

        // var vertices = polygon.getPath();
        // var coords = []
        // for (var i =0; i < vertices.getLength(); i++) {
        //     var xy = vertices.getAt(i);
        //     const lati = xy.lat()
        //     const lngi = xy.lng()
        //     coords.push( { lat: parseFloat(lati.toFixed(6)), lng: parseFloat(lngi.toFixed(6)) } )
        // }

        this.setState({ polygonsToDelete : [...this.state.polygonsToDelete, polygon] })
        this.setState({ polygon })
        this.setState({ fence: polygon.getPath() })
        this.setState({ showModal: true })
        this.setState({ 
            currentPoly: polygon, 
            // polygonsCoords: [...this.state.polygonsCoords, coords],
            // doneDrawingPolys: [...this.state.doneDrawingPolys, polygon],
        })


        // google.maps.event.addListener(polygon, "mouseover", () => {

        //         var vertices = polygon.getPath();
        //         var coords = []
    
        //         for (var i =0; i < vertices.getLength(); i++) {
        //             var xy = vertices.getAt(i);
        //             const lati = xy.lat()
        //             const lngi = xy.lng()
        //             coords.push( { lat: parseFloat(lati.toFixed(6)), lng: parseFloat(lngi.toFixed(6)) } )

        //         }
        //         // debugger
        //         this.setSelectedPolygon(coords)
                

        // })

    }

    // <b>Bermuda Triangle polygon</b><br>Clicked location: <br>51.522883837825944,-0.08266667130044425<br><br>Coordinate 0:<br>51.5222429849892,-0.08258084061196769<br>Coordinate 1:<br>51.52154871757213,-0.0804779887442919<br>Coordinate 2:<br>51.52387180161335,-0.08103588821938956<br>Coordinate 3:<br>51.522883837825944,-0.08266667130044425




    handleChange = e => {
        // console.log(e.target.value)
        this.setState({ [e.target.name]: e.target.value })
    }

    handleBroadcastSubmit = () => {
 
    const broadcast = {
            name: this.state.newBroadCastName,
            code: this.state.newBroadCastCode.toLowerCase(),
            broadcaster_id: this.props.user.id
        }

        API.newBroadCast(broadcast)
            .then(broadcast => 
                
                {
                    if (broadcast.error) {
                        console.log("HELLO FROM HANDLE BROADCAST SUBMIT:", broadcast)
                        this.setState({
                            errorMessage: "Broadcast name already taken",
                            newBroadCastName: "",
                        })
                    } else {
                        this.setState({
                            // renders map component and broadcast RHS column
                            renderMap: true,
                            showBroadcastModal: false,
                            currentBroadcast: broadcast,
                            newBroadCastName: "",
                            newBroadCastCode: "",
                        })           
                    }
         
            })
    }


    handleMessageSubmit = e => {
        // messageWithPolygon
        // console.log("HANDLE MESSAGE SUBMIT", this.state.currentPoly)
        const encodedFence = google.maps.geometry.encoding.encodePath(this.state.fence);
        const broadcastMessage = {
            message: this.state.messageText,
            geofence: encodedFence,
            broadcast_id: this.state.currentBroadcast.id
        }

        API.addMessage(broadcastMessage)
            .then(message => this.setState({
                messageText: "",
                fence: null,
                showModal: false,
                renderNewMessages: true,
                renderEditedMessages: false,
                renderDeletedMessage: false,
                newBroadCastMessages: [...this.state.newBroadCastMessages, message],
                polygon: null,

            })
        
        )

        
        google.maps.event.addListener(this.state.currentPoly, "mouseover", () => {

            // console.log("INSIDE OF EVENT LISTENER", this.state.newBroadCastMessages)
            const polygon = this.state.currentPoly

            var vertices = polygon.getPath();
            var coords = []

            for (var i =0; i < vertices.getLength(); i++) {
                var xy = vertices.getAt(i);
                const lati = xy.lat()
                const lngi = xy.lng()
                coords.push( { lat: parseFloat(lati.toFixed(6)), lng: parseFloat(lngi.toFixed(6)) } )
            }
            // debugger
            this.setSelectedPolygon(coords)
            
        
    })

        // this.setState({
        //     messageText: "",
        //     fence: null,
        //     showModal: false,
        // })
    }

    saveBroadcast = () => {
        API.saveBroadCast(this.state.currentBroadcast.id)
            .then(broadcast => {
                // const polygons = this.state.polygonsToDelete
                // polygons.map(poly => poly.setMap(null))
                this.setState({
                    currentBroadcast: null,
                    polygonsToDelete: null,
                    renderPolygons: false,
            })
        })
                
    }

    cancelBroadcast = () => {
        API.deleteBroadcast(this.state.currentBroadcast.id)
            .then(this.setState({ currentBroadcast: null }))   

    }

    removeMessage = (message) => { 

        // let mssg = decodeGeoCode(message.geofence)

        // const formatedMsg = mssg.map(coord => {
        //     return { lat: coord.latitude, lng: coord.longitude }
        // })
    

        // console.log("FORMATTED", formatedMsg)

        // this.state.polygonInstances.map(poly => {
        //     console.log("sifgus", poly.props.path)
        //     poly.props.path.map(coords => {
        //         const one = coords
        //         const two = formatedMsg

        //         // console.log("ONE", one)
        //         // console.log("1:", one[0]['lat'])
        //         // console.log("2:", two[0]['lat'])
        //         // console.log("3:", one[0]['lng'])
        //         // console.log("4:", two[0]['lng'])
        //         if (one['lat'] === two[0]['lat'] && one['lng'] === two[0]['lng']) {           
        //             // poly.setMap(null)
        //             // poly=null
        //             // poly.props.options
        //         console.log("Its working", poly.props.options.fillOpacity = 0)
        //         console.log("Its working", poly)
                
                 
        //     }
        //     })

        // })
 

        ///////

        console.log("REMOVE MESSAGE:", message)
        const msgs = this.state.newBroadCastMessages.filter(msg => msg.id !== message.id)

        this.setState({ 
            newBroadCastMessages: msgs,
            renderDeletedMessage: true,
            renderEditedMessages: false,
            renderNewMessages: false,  
        })

        API.removeMessage(message.id)
      


        /////////////////////

        

    }

    editMessage = (message) => {

        console.log("INSIDE EDIT MESSAGE:", message)
        this.setState({ 
            editModal: true,
            editText: message.content, 
            messageToEdit: message

        })  
    }

    closeEditMessage = () => {
        this.setState({ editModal: false})
    }

    handleMessageSubmitEdit = () => {

        const messages = this.state.newBroadCastMessages
        const idx = messages.findIndex(msg => msg.id === this.state.messageToEdit.id);
        API.editMessage(this.state.editText, this.state.messageToEdit.id)
            .then(message => 

                this.setState({
                    newBroadCastMessages: [...messages.slice(0, idx), message, ...messages.slice(idx + 1)],
                    editModal: false,
                    editText: "",
                    messageToEdit: null,
                    renderEditedMessages: true,
                    renderNewMessages: false,
                    renderDeletedMessage: false,
                })
                
        )

    }

    toggleMenu = () => {
        this.setState({
            visible: !this.state.visible
        });
    }
        

    render () {

        // console.log("RENDER:", this.state.polygonsCoords)
        // console.log(this.state.showBroadcastModal)
        // console.log("RENDER:", this.state.newBroadCastMessages)
        // console.log("EDITED MESSAGES?", this.state.renderEditedMessages)
        // console.log("POLYGONS TO DELETE:", this.state.polygonsToDelete)
        // console.log("selected polygon:", this.state.selectedPolygon)
        // console.log("DONE DRAWING:", this.state.doneDrawingPolys)
        

        const {user, userObject} = this.props
        const {renderPolygonsOnMap,
                renderNewMessages,
                currentBroadcast,
                renderMap,
                showModal,
                newBroadCastPin,
                showBroadcastModal,
                center,
                content,
                messageText,
                newBroadCastMessages,
                newBroadCastName, 
                editText,
                editModal,
                renderEditedMessages,
                highlight,
                renderDeletedMessage,
                polygonsCoords,
                renderPolygons,
                errorMessage,
                visible,
            } = this.state


        return (

            <div className="main-container"> 

                <HelpSlide visible={visible} toggleMenu={this.toggleMenu} />
                <HelpSlideSelector toggleMenu={this.toggleMenu} />
                
         
                <div className="map-section">

                    { showModal || showBroadcastModal || visible ? <div onClick={this.closeModalHandler} className="back-drop"></div> : null }

                    <button onClick={() => this.createNewBroadcast()}
                    className={'create-new-broadcast' + (currentBroadcast ? '-hide' : "")}
                    >Create new Broadcast</button>

                    {
                        currentBroadcast && 
                        <div className="map-container-parent" >
                            <p>
                            {/* Last fetched: <Moment interval={10000} fromNow>{this.state.lastFetched}</Moment> */}
                            </p>
                            
                            <MapWithADrawingManager
                                googleMapURL={googleMapURL}
                                loadingElement={    <div style={{ height: `100%` }}/>   }
                                containerElement={  <div className="map-container" />  }
                                mapElement={    <div style={{ height: `100%` }} />  }
                                center={center}
                                content={content}
                                doneDrawing={this.doneDrawing}
                                polygons={this.state.polygons}
                                renderPolygonsOnMap={this.renderPolygonsOnMap}
                                renderPolygons={renderPolygons}
                            />
                        </div>
                    }
                    
                    <Modal
                        className="modal"
                        showMessageModal={showModal}
                        showBroadcastModal={showBroadcastModal}
                        showEditModal={editModal}
                        close={this.closeModalHandler}
                        handleMessageSubmit={this.handleMessageSubmit}
                        handleBroadcastSubmit={this.handleBroadcastSubmit}
                        handleMessageSubmitEdit={this.handleMessageSubmitEdit}
                        closeEditMessage={this.closeEditMessage}
                    >


                        {
                            showModal &&
                            <>
                            <form id="message-form" className="message-form">
                            <div className="error-box-dashboard" >
                                <h3>{errorMessage}</h3>
                            </div>  
                                <div>
                                    <textarea
                                        name="messageText"
                                        form="message-form"
                                        onChange={this.handleChange}
                                        required 
                                        value={messageText}
                                    >
                                    Enter your message here
                                    </textarea>
                                </div>
                            </form>
                            </>
                        }


                        {
                            showBroadcastModal &&
                            <form className="broadcast-form-el">
                                <div className="broadcast-form-input">
                                    <label>Name your broadcast</label><br/>
                                    <input
                                        name="newBroadCastName"
                                        type="text"
                                        value={newBroadCastName}
                                        onChange={this.handleChange}
                                        required 
                                        placeholder="e.g. Pokemon Hunt"
                                        maxlength={12}
                                    />
                                </div>
                                <div className="broadcast-form-input">
                                    <label>Choose 6 character code</label><br/>
                                    <input
                                        name="newBroadCastCode"
                                        type="text"
                                        value={newBroadCastPin}
                                        onChange={this.handleChange}
                                        required 
                                        placeholder="e.g. excelsior"
                                        maxlength={6}
                                    />
                                </div>
                            </form>
                        }

                        {
                            editModal &&
                            <form className="edit-form">
                                <div>

                                    <textarea
                                        name="editText"
                                        onChange={this.handleChange}
                                        required 
                                        value={editText}
                                    >
                                    {editText && editText}
                                    </textarea>
                                </div>
                            </form>
                        }
                                       
				    </Modal>

                </div>

                {
                    currentBroadcast && 
                        <BroadCast
                            newBroadCastMessages={newBroadCastMessages}
                            renderNewMessages={renderNewMessages}
                            saveBroadcast={this.saveBroadcast}
                            currentBroadcast={currentBroadcast}
                            cancelBroadcast={this.cancelBroadcast}
                            removeMessage={this.removeMessage}
                            editMessage={this.editMessage}
                            renderEditedMessages={renderEditedMessages}
                            highlight={highlight}
                            renderDeletedMessage={renderDeletedMessage}
                            polygonsCoords={polygonsCoords}
                        />
                }
                
              
            
            </div>
        )
    }

}

export default DashBoard