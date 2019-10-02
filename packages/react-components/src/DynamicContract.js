import React from "react";
import PropTypes from "prop-types";
import { drizzleConnect } from "@pacta-app/react-plugin";
import ContractData from "./ContractData";

class DynamicContract extends React.Component {
  constructor(props, context) {
    super(props);

    try {
      var contractConfig = {
        contractName: this.props.contract || this.props.address,
        web3Contract: new context.drizzle.web3.eth.Contract(
          this.props.abi,
          this.props.address,
          this.props.options
        )
      };
      context.drizzle.addContract(contractConfig, this.props.events);
    } catch (e) {
      console.log("ERROR", this.props.contract || this.props.address, e);
    }
  }

  render() {
    try {
      const contracts = this.props.store.getState().contracts;
      // Contract is not yet intialized.
      if (
        !contracts[this.props.contract || this.props.address] ||
        !contracts[this.props.contract || this.props.address].initialized
      ) {
        return <span>Initializing...</span>;
      }
      if (this.props.render)
        if (this.props.method)
          return (
            <ContractData
              contracts={contracts}
              contract={this.props.contract || this.props.address}
              method={this.props.method}
              methodArgs={this.props.methodArgs}
              sendArgs={this.props.sendArgs}
              render={this.props.render}
            />
          );
        else
          return this.props.render(this.props.contract || this.props.address);
      if (this.props.children) {
        const extraProps = {
          contracts: contracts,
          contract: this.props.contract || this.props.address
        };
        const mapper = function(child) {
          if (!React.isValidElement(child)) return child;
          return React.cloneElement(child, {
            ...extraProps,
            children: React.Children.map(child.props.children, mapper)
          });
        };
        return React.Children.map(this.props.children, mapper);
      }
      if (this.props.method)
        return (
          <ContractData
            contracts={contracts}
            contract={this.props.contract || this.props.address}
            method={this.props.method}
            methodArgs={this.props.methodArgs}
            sendArgs={this.props.sendArgs}
          />
        );
      return <>Contract: {this.props.contract || this.props.address}</>;
    } catch (e) {
      console.log("ERROR in DynamicContract render", e);
      return <div class="error">ERROR: {e.message}</div>;
    }
  }
}

DynamicContract.contextTypes = {
  drizzle: PropTypes.object
};

DynamicContract.propTypes = {
  contracts: PropTypes.object.isRequired,
  address: PropTypes.string.isRequired,
  abi: PropTypes.array.isRequired,
  contract: PropTypes.string,
  options: PropTypes.object,
  events: PropTypes.object,
  render: PropTypes.func
};

/*
 * Export connected component.
 */

const mapStateToProps = state => {
  return {
    contracts: state.contracts
  };
};

export default drizzleConnect(DynamicContract, mapStateToProps);
