* expand operation should include description, all parent and children concepts as input to the prompt as well to preserve the context.
* expand should pass all children as well to avoid the LLM returning the same children again.
* for some reason I used expand on JavaScript which outputted DOM-Manipulation which was never added to its children list. expand operation should be added to the children array in the direct parent.
* trace path always return this error: 
❌ Error: Cannot access 'normalizedResults' before initialization
* explore should add the output as siblings of the selected concept (update the parent's children list as well).
* validate links needs to be revisited. it's usefulness is questionable.