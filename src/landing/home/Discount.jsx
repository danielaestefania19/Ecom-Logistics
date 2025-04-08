import { Card, CardBody, CardHeader, Image } from "@heroui/react";
import entregagratis from '../../assets/entregagratis.png'

const Discount = () => {
  return (
    <section className="bg-primary py-10 px-4">
      <div className="max-w-7xl mx-auto flex justify-center">
        <div className="flex flex-col md:flex-row items-center justify-center gap-32">
          <div className="text-center md:text-right">
            <h2 className="text-third text-2xl sm:text-3xl font-bold mb-1">
              Are you overpaying
            </h2>
            <span className="text-white text-2xl sm:text-3xl font-bold">
              and losing time?
            </span>
          </div>
          <Card className="bg-white px-12 rounded-xl shadow-md text-center">
            <CardHeader className="flex gap-1">
              <Image
                alt="heroui logo"
                height={40}
                radius="sm"
                src={entregagratis}
                width={40}
              />
              <div className="flex flex-col">
                <p className="text-primary text-lg font-bold">Free daily LTL Pickup</p>
                <p className="text-gray-500 text-sm">In the Bay Area</p>
              </div>
            </CardHeader>
          </Card>
        </div>
      </div>
    </section>
  );
};

export default Discount;
