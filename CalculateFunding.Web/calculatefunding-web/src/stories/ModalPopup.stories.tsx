import React, {useState} from 'react';
import {Story, Meta} from '@storybook/react';
import {ModalPopup, ModalPopupProps} from "../components/ModalPopup";

export default {
    title: 'Components/ModalPopup',
    component: ModalPopup,
};

const Wrapper = (args: ModalPopupProps) => {
    const [isOpen, setOpen] = useState(args.isOpen);

    const handleModalClose = () => {
        alert('handleModalClose');

        setOpen(false);
    }

    return (
        <div className='govuk-grid-row'>
            <h2 className='govuk-heading-l'>Modal Popup Test</h2>
            <p className='govuk-body-m'>
                Use the isOpen property in the table below to show and hide the modal.{' '}
            </p>
            <ModalPopup {...args} isOpen={isOpen} onClose={handleModalClose}>{args.children}</ModalPopup>
        </div>
    );
}

const Template: Story<ModalPopupProps> = (args: ModalPopupProps) => (
    <Wrapper {...args}>{args.children}</Wrapper>
);

export const OpenWithContent = Template.bind({});

OpenWithContent.args = {
    isOpen: true,
    token: 'token',
    children: <div>
        <h3 className='govuk-heading-l'>hello storybook</h3>
        <p className='govuk-body-m'>Lorem ipsum dolor sit amet, consectetur adipiscing elit.
            Quisque nec nibh lacus. Donec feugiat elit at mauris suscipit, cursus euismod urna viverra. Pellentesque sed
            ex quam. Pellentesque pharetra nibh rutrum lobortis lobortis.</p>
    </div>
} as ModalPopupProps;
