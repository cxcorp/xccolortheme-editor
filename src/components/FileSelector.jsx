import React, { Component } from 'react'

/*
type Props = {
    onChoose: (File) => void
}
*/

export class FileSelector extends Component {
    constructor(props) {
        super(props)
        this.openFile = this.openFile.bind(this)
        this.state = { currentFile: null }
    }

    openFile(e) {
        const input = e.target
        this.props.onChoose(input.files[0])
        this.setState({
            currentFile: input.files[0] ? input.files[0].name : null
        })
    }

    render() {
        const currentFileText = this.state.currentFile || 'Choose a theme file to begin'
        return (
            <div className="file-selector">
                <p>{currentFileText}</p>
                <input type='file' accept=".xccolortheme,.dvtcolortheme" onChange={this.openFile} />
            </div>
        )
    }
}
