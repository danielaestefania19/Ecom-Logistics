import { Input, Textarea, Button } from "@heroui/react";

const ContactUs = () => {
    return (
        <section className="w-full bg-primary py-16 px-4 md:px-0 flex justify-center">
            <div className="bg-white rounded-2xl max-w-6xl w-full px-20 py-12 shadow-md">
                <h2 className="text-3xl md:text-4xl font-bold text-center mb-2">Contact Us</h2>
                <p className="text-center text-gray-500 mb-8 max-w-md mx-auto text-sm">
                    We would like to hear from you! Fill out your contact information below. When we receive your inquiry, we will contact you as soon as possible.
                </p>

                <form className="grid grid-cols-1 md:grid-cols-2 gap-4">
                    <div>
                        <label className="mb-1 font-medium text-gray-800">Name:</label>
                        <Input
                            label="Name"
                            placeholder="E.g. Juan Diego"
                            variant="flat" // o "bordered"
                            className="bg-white border border-black rounded-md focus:outline-none focus:ring-2 focus:ring-black"
                        />



                    </div>
                    <div>
                        <label className="block mb-1 font-medium text-gray-800">Phone:</label>
                        <Input
                            placeholder="Ej: +1 12345678"
                            className="rounded-md"
                        />
                    </div>
                    <div>
                        <label className="block mb-1 font-medium text-gray-800">Email Address:</label>
                        <Input
                            type="email"
                            variant="flat"
                            label="Email Address"
                            defaultValue="junior@heroui.com"
                            classNames={{
                                base: "bg-white border border-black rounded-md focus:outline-none focus:ring-2 focus:ring-black",
                            }}
                            className="max-w-xs"
                        />

                    </div>
                    <div>
                        <label className="block mb-1 font-medium text-gray-800">Address:</label>
                        <Input
                            placeholder="Ej: 25509 Industrial Blvd..."
                            className="rounded-md"
                        />
                    </div>
                    <div className="md:col-span-2">
                        <label className="block mb-1 font-medium text-gray-800">Message:</label>
                        <Textarea
                            placeholder="Any additional information..."
                            className="rounded-md min-h-[120px]"
                        />
                    </div>
                    <div className="md:col-span-2 flex justify-center mt-4">
                        <Button
                            className="px-8 py-2 rounded-full bg-gray-900 text-white font-semibold text-lg hover:bg-gray-800"
                        >
                            Submit
                        </Button>
                    </div>
                </form>
            </div>
        </section>
    );
};

export default ContactUs;
