const React = require('react');
const { Fragment } = require('react');
const { FORCE_RE_RENDER } = require('@storybook/core-events');
const { addons, types, useEffect } = require('@storybook/addons');
const { Separator, Form } = require('@storybook/components');
const { useGlobals } = require('@storybook/api');

addons.register("criipto/client-toolbar", () => {
  addons.add("client-toolbar/toolbar", {
    title: "Custom Client Toolbar",
    //👇 Sets the type of UI element in Storybook
    type: types.TOOL,
    //👇 Shows the Toolbar UI element if either the Canvas or Docs tab is active
    match: ({ viewMode }) => !!(viewMode && viewMode.match(/^(story|docs)$/)),
    render: ({ active }) => {
      const [globals, updateGlobals] = useGlobals();
      const domain = globals.domain;
      const clientID = globals.clientID;

      const handleDomainChange = (event) => {
        updateGlobals({
          domain: event.target.value,
        });
        // Invokes Storybook's addon API method (with the FORCE_RE_RENDER) event to trigger a UI refresh
        addons.getChannel().emit(FORCE_RE_RENDER);
      }

      const handleClientIDChange = (event) => {
        updateGlobals({
          clientID: event.target.value,
        });
        // Invokes Storybook's addon API method (with the FORCE_RE_RENDER) event to trigger a UI refresh
        addons.getChannel().emit(FORCE_RE_RENDER);
      }

      return (
        <Fragment>
          <Separator />
          <div style={{display: 'flex', alignItems: 'center', gap: '5px'}}>
            <Form.Input style={{minHeight: '20px', padding: '3px 6px', minWidth: '250px'}} value={domain} placeholder="Domain" onChange={handleDomainChange} />
            <Form.Input style={{minHeight: '20px', padding: '3px 6px', minWidth: '250px'}} value={clientID} placeholder="Client ID" onChange={handleClientIDChange} />
          </div>
        </Fragment>
      )
    },
  });
});