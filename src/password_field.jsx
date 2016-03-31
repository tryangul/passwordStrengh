import React from "react"
import ReactDOM from "react-dom"
import zxcvbn from "zxcvbn"
import Popover from "react-bootstrap/lib/Popover"
import Overlay from "react-bootstrap/lib/Overlay"
import { validatePassword } from "../util/props_utils"

type StrengthBarProps = {
    'index' : number,
    'color' : string,
}

export class StrengthBar extends React.Component<{}, StrengthBarProps, {}> {
    render(): React.Element {
        const {color, index} = this.props
        const margin = index < 3 ? '.25rem' : '0'
        const meterStyle = {height: '1rem', background: color, marginRight: margin}

        return (
            <div className="col-xs-3" style={{padding: '0'}}>
                <div style={meterStyle}></div>
            </div>
        )
    }
}

type Props = {
    'show' : bool,
    'onChange' : Function,
    'id': string,
    'autofocus': bool,
}

export default class PasswordField extends React.Component<{}, Props, {}> {

    constructor(props) {
        super(props)

        this.state = {
            score: [],
            color: '#d3d3d3',
            hasLetter: false,
            hasNumber : false,
            hasSpecialChar : false,
            hasEightChars : false,
            target: '',
            show: false,
        }
    }

    componentWillReceiveProps(nextProps) {
        nextProps.show && this.setState({show: nextProps.show})
    }

    testStrength() {
        const passwordField = this.refs.passwordField
        const value = passwordField.value
        const score = value ? zxcvbn(value).score || 1 : 0
        const strengthColor = {
            0: '#d3d3d3',
            1: '#d9534f',
            2: '#f0ad4e',
            3: '#428bca',
            4: '#5cb85c'
        }
        const scoreArr = Array.from({length: score})

        this.setState({score: scoreArr, color: strengthColor[score]})

    }

    testRequirements() {
        const letter = new RegExp('[a-zA-Z]')
        const number = new RegExp('[0-9]')
        const specialChar = new RegExp('[\!@#\$%\^\&\*\)\(+=._-]')

        const passwordField = this.refs.passwordField
        const value = passwordField.value

        const newState = {
            'hasLetter' : letter.test(value),
            'hasNumber' : number.test(value),
            'hasSpecialChar' : specialChar.test(value),
            'hasEightChars' : value.length >= 8,
        }
        this.setState(newState)
    }

    handleChange(event) {
        this.props.onChange(event)
        this.testStrength()
        this.testRequirements()
    }

    testColor(criteria: boolean): Object {
        const passwordField = this.refs.passwordField
        const value = passwordField && passwordField.value
        const color = criteria ? '#5cb85c' : '#d9534f'

        if (!value) return {}

        return {color: color}
    }

    showRequirements() {
        const passwordField = this.refs.passwordField
        this.setState({ target: ReactDOM.findDOMNode(passwordField), show: true })
    }

    handleFocus(e) {
        this.showRequirements()
    }

    hideRequirements() {
        const passwordField = this.refs.passwordField
        const validPassword = validatePassword(passwordField.value)
        validPassword && this.setState({ target: ReactDOM.findDOMNode(passwordField), show: false })
    }

    handleBlur(e) {
        this.hideRequirements()
    }

    render(): React.Element {
        const {id, autoFocus} = this.props
        const {color, score, hasLetter, hasNumber, hasSpecialChar, hasEightChars} = this.state
        const bullet = <span style={{fontWeight: 'bold'}}>•&nbsp;&nbsp;</span>
        const margin = document.documentElement.clientWidth > 500 ? '2.75rem 0 0 18rem' : '2.75rem 0 0 8rem'

        return (
            <div>
                <input type="password"
                     className="form-control"
                     id={id}
                     onChange={this.handleChange.bind(this)}
                     placeholder="********"
                     ref="passwordField"
                     autoFocus={autoFocus}
                     onFocus={this.handleFocus.bind(this)}
                     onBlur={this.handleBlur.bind(this)} />

                <div style={{paddingBottom: '1rem', marginTop: '1%'}}>

                    {score.map((rank, i) => <StrengthBar color={color} key={i} index={i} /> )}

                </div>

                <Overlay show={this.state.show}
                         target={()=> ReactDOM.findDOMNode(this.refs.passwordField)}
                         placement="bottom">
                    <Popover style={{margin: margin, fontFamily: "inherit", fontSize: '15px'}} onClick={this.hideRequirements.bind(this)} id="password-reqs">
                        <p className="help-block">Must have at least:</p>
                        <ul style={{padding: '0 1rem 0 0.5rem', listStyle: 'none'}}>
                            <li style={this.testColor(hasEightChars)}>{bullet} 8 characters</li>
                            <li style={this.testColor(hasLetter)}>{bullet} 1 letter</li>
                            <li style={this.testColor(hasNumber)}>{bullet} 1 number</li>
                            <li style={this.testColor(hasSpecialChar)}>{bullet} 1 special character</li>
                        </ul>
                    </Popover>
                </Overlay>
            </div>
        )
    }
}
