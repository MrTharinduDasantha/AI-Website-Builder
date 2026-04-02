import {
  AccountSettingsCards,
  ChangePasswordCard,
  DeleteAccountCard,
} from "@daveyplate/better-auth-ui";

const Settings = () => {
  return (
    <div className="w-full p-4 flex justify-center items-center flex-col gap-6 py-12 min-h-[90vh]">
      <AccountSettingsCards
        classNames={{
          card: {
            base: "bg-black/10 ring ring-indigo-950 max-w-xl mx-auto",
            footer: "bg-black/10 ring ring-indigo-950",
          },
        }}
      />
      <div className="w-full">
        <ChangePasswordCard
          classNames={{
            base: "bg-black/10 ring ring-indigo-950 max-w-xl mx-auto",
            footer: "bg-black/10 ring ring-indigo-950",
          }}
        />
      </div>
      <div className="w-full">
        <DeleteAccountCard
          classNames={{
            base: "bg-black/10 ring ring-indigo-950 max-w-xl mx-auto",
          }}
        />
      </div>
    </div>
  );
};

export default Settings;
