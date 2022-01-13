import { waitFor } from "@testing-library/react";
import { act, renderHook } from "@testing-library/react-hooks";

import { useCharacterSubstitution } from "../../hooks/useCharacterSubstitution";

describe("useCharacterSubstitution hook", () => {

    const render = () => {
        const { result } = renderHook(() => useCharacterSubstitution());

        return result;
    }
    it("replaces starting numeric characters with underscores", () => {
        const result = render();

        act(() => result.current.substituteCharacters("0Calculation"));

        waitFor(() => expect(result.current.substitution).toEqual("_0Calculation"));
    });

    it("wraps reserved words with []", () =>{
        const result = render();

        act(() => result.current.substituteCharacters("Alias"));

        waitFor(() => expect(result.current.substitution).toEqual("[Alias]"));
    });

    it("changes special characters to words", () =>{
        const result = render();

        act(() => result.current.substituteCharacters("%"));

        waitFor(() => expect(result.current.substitution).toEqual("Percent"));
    });
})
