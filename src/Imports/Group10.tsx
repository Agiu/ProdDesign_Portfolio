import imgRectangle from "figma:asset/4eea6b2e81b9b3b46b9ba48553970fccb7553127.png";
import imgRectangle1 from "figma:asset/a6650c6685576f2c7386ed52359ca8cbb108a3a9.png";
import imgRectangle2 from "figma:asset/587b3024327f4e7301b56f29a7bc8ada7005423b.png";

function Frame1() {
  return (
    <div className="absolute content-stretch flex flex-col font-medium gap-[39px] items-start left-[214px] text-[#3c7089] text-[40px] top-[672.37px] w-[897px] whitespace-pre-wrap">
      <p className="font-['Andada_Pro:Regular',sans-serif] font-normal leading-[0] relative shrink-0 w-full">
        <span className="font-['Andada_Pro:Medium',sans-serif] leading-[normal]">{`I'm mostly a hobbyist that has swaths of passion within tech and other creative fields. You could probably call me a `}</span>
        <span className="font-['Andada_Pro:Medium_Italic',sans-serif] italic leading-[normal]">
          Swiss Army Knife™
        </span>
        <span className="font-['Andada_Pro:Medium',sans-serif] leading-[normal]">
          .
        </span>
      </p>
      <p className="font-['Andada_Pro:Medium',sans-serif] leading-[normal] relative shrink-0 w-full">
        I love playing video games during my free time,
        listening to new music, and practicing my violin. When
        I’m not doing these I’m typically reading finance,
        design books, or enjoying a walk in the city.
      </p>
      <div className="font-['Andada_Pro:Medium',sans-serif] leading-[0] relative shrink-0 text-black w-full">
        <p className="mb-0">
          <span className="font-['Andada_Pro:Medium',sans-serif] font-medium leading-[normal]">{`B.S. in Computer Science At `}</span>
          <span className="font-['Andada_Pro:ExtraBold_Italic',sans-serif] font-extrabold italic leading-[normal]">
            Trinity University
          </span>
        </p>
        <p>
          <span className="font-['Andada_Pro:Medium',sans-serif] font-medium leading-[normal]">{`Masters in HCI+D  at `}</span>
          <span className="font-['Andada_Pro:ExtraBold_Italic',sans-serif] font-extrabold italic leading-[normal]">
            University of Washington
          </span>
        </p>
      </div>
    </div>
  );
}

function Frame() {
  return (
    <div className="absolute content-stretch flex gap-[80px] items-center left-[1214px] top-[774.82px]">
      <div
        className="h-[334px] relative shrink-0 w-[536px]"
        data-name="Rectangle"
      >
        <div className="absolute inset-0 overflow-hidden pointer-events-none">
          <img
            alt=""
            className="absolute h-[159.17%] left-[-0.09%] max-w-none top-[-29.82%] w-[100.19%]"
            src={imgRectangle}
          />
        </div>
      </div>
      <div
        className="h-[324px] relative shrink-0 w-[367px]"
        data-name="Rectangle"
      >
        <img
          alt=""
          className="absolute inset-0 max-w-none object-cover pointer-events-none size-full"
          src={imgRectangle1}
        />
      </div>
    </div>
  );
}

function Group() {
  return (
    <div className="absolute contents left-[214px] top-[672.37px]">
      <Frame1 />
      <Frame />
    </div>
  );
}

export default function Group1() {
  return (
    <div className="relative size-full">
      <div className="absolute bg-[#feb1a5] h-[1297px] left-0 top-0 w-[2355px]" />
      <Group />
      <div
        className="absolute h-[541.906px] left-[46px] rounded-[30px] top-[55.53px] w-[2264px]"
        data-name="Rectangle"
      >
        <img
          alt=""
          className="absolute inset-0 max-w-none object-cover pointer-events-none rounded-[30px] size-full"
          src={imgRectangle2}
        />
      </div>
    </div>
  );
}