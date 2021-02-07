import "./App.css";
import data from "./people.json";
import output from "./output.json";
import input from "./input.json";
import React, { Component } from "react";

import {
  ForceGraph2D,
  ForceGraph3D,
  ForceGraphVR,
  ForceGraphAR,
} from "react-force-graph";
import SpriteText from "three-spritetext";

class App extends Component {
  state = {
    dataParsed: false,
    nodeIds: [],
    nodes: [],
    links: [],
    typeProps: {
      Album: ["artist", "producer", "track", "name", "date", "description"],
      Song: ["writer", "name", "description"],
      Songwriter: ["member", "name", "description"],
      SoloArtist: ["name", "description"],
      Producer: ["name", "description"],
      Band: ["member", "name", "description"],
    },
  };

  shouldComponentUpdate(nextProps, nextState) {
    if (nextState.dataParsed !== this.state.dataParsed) return true;
  }

  componentDidMount() {
    input["@graph"].forEach((element, index) => {
      if (index > 2) {
        this.setState({
          dataParsed: true,
        });
      } else {
        if (typeof element["@type"] === "string") {
          this.handleNode(element, element["@type"], index);
        } else if (typeof element["@type"] === "object") {
          element["@type"].forEach((elementType) => {
            this.handleNode(element, elementType, index);
          });
        } else {
          // undefined
          // console.log(typeof element["@type"], element);
        }
      }
    });
  }

  arrayAdd(array, element) {
    const newArray = array.slice();
    newArray.push(element);
    return newArray;
  }

  handleObject(elemId, object, objectType, group) {
    this.setState((prevState) => {
      if (!prevState.nodeIds.includes(object)) {
        const uriParts = object.split("/");
        return {
          nodeIds: this.arrayAdd(prevState.nodeIds, object),
          nodes: this.arrayAdd(prevState.nodes, {
            id: object,
            name: decodeURIComponent(uriParts[uriParts.length - 1]),
            group: group,
          }),
          links: this.arrayAdd(prevState.links, {
            source: elemId,
            target: object,
            name: objectType,
            // value: group,
          }),
        };
      } else {
        return {
          links: this.arrayAdd(prevState.links, {
            source: elemId,
            target: object,
            name: objectType,
            // value: group,
          }),
        };
      }
    });
  }

  handleNode(element, elemType, group) {
    this.setState((prevState) => {
      if (!prevState.nodeIds.includes(element["@id"])) {
        let uriParts = element["@id"].split("/");

        let typeParts = elemType.split("/");
        const type = typeParts[typeParts.length - 1];

        this.state.typeProps[type].forEach((prop) => {
          if (prop in element) {
            if (typeof element[prop] === "string") {
              this.handleObject(element["@id"], element[prop], prop, group);
            } else if (typeof element[prop] === "object") {
              element[prop].forEach((subProp) => {
                this.handleObject(element["@id"], subProp, prop, group);
              });
            }
          }
        });
        return {
          nodeIds: this.arrayAdd(prevState.nodeIds, element["@id"]),
          nodes: this.arrayAdd(prevState.nodes, {
            id: element["@id"],
            name: decodeURIComponent(uriParts[uriParts.length - 1]),
            group: group,
          }),
        };
      }
    });
  }

  render() {
    let graph = null;

    if (this.state.dataParsed) {
      let graphData = {
        nodes: this.state.nodes,
        links: this.state.links,
      };

      graph = (
        <div className="graph-vis">
          <ForceGraph3D
            graphData={graphData}
            nodeRelSize={6}
            linkDirectionalArrowLength={3.5}
            linkDirectionalArrowRelPos={1}
            linkCurvature={0.0}
            nodeLabel="name"
            enableNavigationControls="true"
            controlType="trackball"
            nodeAutoColorBy="group"
            linkWidth={1}
            linkDirectionalParticles={1}
          />
        </div>
      );
    }

    return <div className="App">{graph}</div>;
  }
}

function genRandomTree(N = 300, reverse = false) {
  return {
    nodes: [...Array(N).keys()].map((i) => ({ id: i })),
    links: [...Array(N).keys()]
      .filter((id) => id)
      .map((id) => ({
        [reverse ? "target" : "source"]: id,
        [reverse ? "source" : "target"]: Math.round(Math.random() * (id - 1)),
      })),
  };
}

export default App;
