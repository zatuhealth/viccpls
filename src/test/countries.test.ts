import { describe, expect, it } from "vitest";
import { countries, internationalPhone, phoneAuthEmail, phoneParts } from "@/lib/countries";

describe("Country and phone forms", () => {
  it("offers Uganda with its +256 prefix", () => {
    expect(countries.find((country) => country.name === "Uganda")).toEqual({ code: "UG", name: "Uganda", callingCode: "+256" });
  });
  it("stores a Ugandan mobile number with the selected calling prefix", () => {
    expect(internationalPhone("0772 123456", "UG")).toBe("+256772123456");
  });
  it("keeps an existing international number intact", () => {
    expect(internationalPhone("+254712123456", "UG")).toBe("+254712123456");
    expect(phoneParts("+254712123456", "UG")).toEqual({ country: "KE", number: "712123456" });
  });
  it("derives the same sign-in identity from a mobile number however it is typed", () => {
    expect(phoneAuthEmail("0772 123456", "UG")).toBe("256772123456@phone.zatuhealth.com");
    expect(phoneAuthEmail("+256772123456", "UG")).toBe("256772123456@phone.zatuhealth.com");
  });
});